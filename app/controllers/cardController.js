var Card = require('../models/card');
import BaseController from './base.controller';

// create and save new card
class CardsController extends BaseController {
    whitelist = [
        'id',
        'wbs',
        'cardName',
        'parentCard'
    ];
    create = async (req, res) => {
        // validate request
        if (!req.body) {
            res.status(400).send({ message: "Content can not be emtpy!" });
            return;
        }
        const params = this.filterParams(req.body, this.whitelist);
        // new card
        const card = new Card({
            ...params,
            userId: req.user.id
        })

        // save card in the database
        const newCard = await card.save(card)
        if (newCard) {
            return res.status(200).json({ message: 'card saved successfully', details: newCard });
        }
        return res.status(200).json({ message: 'issue with card creation' })
    }

    // retrieve and return all card/ retrive and return a single card
    findAll = async (req, res) => {
          const userId = req.user.id;
          const cards = await Card.find({userId: userId}).populate('parentCard').exec();
          if (cards) {
              return res.status(200).json({ message: 'card fetched successfully', details: cards });
          }
          return res.status(200).json({ message: 'issue with card fetching' })

    }

    // Update a new idetified card by card id
    update = (req, res) => {
        if (!req.body) {
            return res
                .status(400)
                .send({ message: "Data to update can not be empty" })
        }

        const id = req.params.id;
        Card.findByIdAndUpdate(id, req.body, { useFindAndModify: false, new: true})
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Update card with ${id}. Maybe card not found!` })
                } else {
                    res.send(data)
                }
            })
            .catch(err => {
                res.status(500).send({ message: "Error Update card information" })
            })
    }

    findOne = (req, res) => {
        const id = req.params.id;

        Card.findById(id).populate('parentCard')
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
                } else {
                    res.send({
                        message: "card was fetched successfully!",
                        data: data
                    })
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Could not delete card with id=" + id
                });
            });
    }
    // Delete a card with specified card id in the request
    delete = (req, res) => {
        const id = req.params.id;

        Card.findByIdAndDelete(id)
            .then(data => {
                if (!data) {
                    res.status(404).send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
                } else {
                    res.send({
                        message: "card has been deleted successfully!"
                    })
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Could not delete card with id=" + id
                });
            });
    }
}
export default new CardsController();