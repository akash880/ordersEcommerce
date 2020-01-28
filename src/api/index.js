import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import orders from './order';
export default ({ config, db }) => {
	let api = Router();

	// mount the facets resource
	api.use('/facets', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		res.json({ version });
	});
	api.get('/createOrders',orders.createOrder);
	api.post('/addToCart',orders.addToCart);
	api.post('/shopNow',orders.shopNow);
	api.post('/removeItemFromCart',orders.removeItemFromCart);
	

	return api;
}
