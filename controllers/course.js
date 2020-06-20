const { courseModel } = require('../models')

module.exports = {
    get: {
        index: (req, res, next) => {
            const user = req.user;
            courseModel.find()
                .then(courses => {
                    if (!user) {
                        let sorted = [...courses].sort((a, b) => { return b.users.length - a.users.length })
                        const topCourses = sorted.slice(0, 3);
                        res.render('indexNotAuth.hbs', { title: 'Course | Home page', courses: topCourses, user });
                        return;
                    }
                    // let date = courses.createdAt.toString().slice(0,21) //da se naprawvi datata
                    const sorted = [...courses].sort((a, b) => {
                        if (b.createdAt === a.createdAt) {
                            return a.title.localeCompare(b.title)
                        }
                        return b.createdAt - a.createdAt
                    })
                    res.render('indexAuth.hbs', { title: 'Course | Home page', courses: sorted, user });
                    return
                })
                .catch(err => console.log(err))
        },
        create: (req, res, next) => {
            const user = req.user;
            res.render('create.hbs', { title: 'Create course | course Workshop', user })
        },
        details: (req, res, next) => {
            const id = req.params.id;
            const user = req.user || 'undefined';
            courseModel.findById(id).populate('accessories')
                .then(course => {
                    course.isCreator = false;
                    course.isEnrolled = false;
                    if (course.creatorId.toString() === user.id) {
                        course.isCreator = true;
                    }
                    if (course.users.includes(user.id.toString())) {
                        course.isEnrolled = true;
                    }
                    res.render('details.hbs', { title: 'course details', course, user })
                })
                .catch(err => res.render('404.hbs', { msg: err }))
        },
        delete: (req, res, next) => {
            const user = req.user;
            courseModel.findByIdAndDelete(req.params.id)
                .then(() => res.redirect('/'))
                .catch(err => next(err))
        },
        enroll: (req, res, next) => {
            const user = req.user;
            courseModel.findByIdAndUpdate(req.params.id, { $push: { users: user.id } })
                .then(() => res.redirect(`/details/${req.params.id}`))
                .catch(err => console.log(err))
        },
        notFound: (req, res, next) => {
            const user = req.user;
            res.render('404.hbs', { title: 'course | Not found page', user })
        },
        edit: (req, res, next) => {
            const courseId = req.params.id;
            const user = req.user;
            courseModel.findById(courseId)
                .then((course) => res.render('edit', { title: 'Edit course', user, course }))
                .catch(err => console.log(err))
        },
        search: (req, res, next) => {
            const user = req.user;
            const title = req.query.title;
            courseModel.find({ title: { $regex: title, $options: 'i' } })
                .then((courses) => {
                    res.render('indexAuth', { user, courses })
                })
                .catch(err => console.log(err))
        }
    },
    post: {
        create: (req, res, next) => {
            const { title = null, description = null, imageUrl = null, isPublic} = req.body;
            const creatorId = req.user.id;
            const user = req.user;
          
            courseModel
                .create(
                    { title, description, imageUrl, isPublic: isPublic === 'on', users: [], creatorId: creatorId, createdAt: Date.now() }
                )
                .then(course => {
                    res.redirect('/')
                }
                )
                .catch(err => {
                    if (err.name == 'ValidationError') {
                        res.render('create.hbs', { title: 'Create course', user, errors: err.errors })
                        return;
                    }
                    next(err);
                    console.log(err)
                })
        },
        edit: (req, res, next) => {
            const courseId = req.params.id;
            const user = req.user;
            // const { name = null, description = null, imageUrl = null, difficulty = null, createrId = null } = req.body;
            const { title, description, imageUrl, isPublic } = req.body;
            // let { title, description, imageUrl, isPublic = false } = req.body;
            // if (isPublic) {
            //     isPublic = true;
            // }
            courseModel.findByIdAndUpdate(courseId, { title, description, imageUrl, isPublic: isPublic === 'on' }, { runValidators: true })
                .then(course => res.redirect(`/details/${course.id}`))
                .catch(err => {
                    if (err.name == 'ValidationError') {
                        courseModel.findById(courseId)
                            .then(course => res.render('edit.hbs', { title: 'Create course', user, course, errors: err.errors }))
                            .catch(err => console.log(err))
                        return;
                    }
                    next(err);
                    console.log(err)
                })
        }
    }
}

