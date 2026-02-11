const express = require('express')
const { authenticate } = require('../middleware/auth')
const crmSystems = require('../config/crmSystems')

const router = express.Router()
/**
 * GET /api/crm/systems
 *
 * Возвращает список доступных CRM-систем.
 * Фронтенд использует его для выпадающего списка.
 */

router.get('/systems', authenticate, (req, res) => {
    const list = crmSystems.map(crm=> ({
        id: crm.id,
        name: crm.name
    }))
    res.json(list)
})
module.exports = router