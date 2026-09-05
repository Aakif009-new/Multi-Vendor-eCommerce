import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createAddressSchema, updateAddressSchema } from '../schemas/address.schema';

const router = Router();

router.use(authenticate);

router.get('/', AddressController.getAddresses);
router.post('/', validate(createAddressSchema), AddressController.createAddress);
router.put('/:id', validate(updateAddressSchema), AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);
router.patch('/:id/default', AddressController.setDefault);

export default router;
