import { Router } from 'express';
import {
    getAllDipendenti,
    getDipendente,
    postDipendente,
    updateDipendente,
    deleteDipendente,
    deleteDipendenti,
} from '../controllers/dipendenti.controller.js';

const router = Router();

router.get('/', getAllDipendenti);
router.get('/:id', getDipendente);
router.post('/', postDipendente);
router.put('/:id', updateDipendente);
router.delete('/:id', deleteDipendente);
router.delete('/', deleteDipendenti);


export default router;


