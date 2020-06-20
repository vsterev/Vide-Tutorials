const { Router } = require('express')
const courseController = require('../controllers/course')
const authController = require('../controllers/authentication')
const auth = require('../utils/auth')
const router = Router()

router.get('/', auth(false), courseController.get.index)
router.get('/course/create', auth(), courseController.get.create)
router.post('/course/create', auth(), courseController.post.create)
router.get('/details/:id', auth(), courseController.get.details)
router.get('/login', authController.get.login)
router.post('/login', authController.post.login)
router.get('/register', authController.get.register)
router.post('/register', authController.post.register)
router.get('/logout', auth(), authController.get.logout)

router.get('/search/', auth(), courseController.get.search)
router.get('/edit/:id', auth(), courseController.get.edit)
router.post('/edit/:id', auth(), courseController.post.edit)

router.get('/delete/:id', auth(), courseController.get.delete)
router.get('/enroll/:id', auth(), courseController.get.enroll)
router.all('*', auth(false), courseController.get.notFound)

module.exports = router