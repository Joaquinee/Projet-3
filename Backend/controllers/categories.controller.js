const db = require('./../models');
const Categories = db.categories
const auth = require('../middlewares/auth');

exports.findAll = async (req, res) =>  {
	try{
		const works = await Categories.findAll();
		return res.status(200).json(works);
	}catch(err){
		return res.status(500).json({ error: new Error('Something went wrong')})
	}

}

exports.create = async (req, res) => {

	try {
		console.log(req)
		const category = await Categories.create({
			name : req.body.name
		})
	
		return res.status(201).json(category)
	} catch (err) {
		console.log(err)
		return res.status(500).json({ error: new Error('Something went wrong')})
	}

}
