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

     populateWBS = async (data) => {
        const { parentCard } = data;
        if(!parentCard) {
            // get next wbs
            const getCurrentWBS = await Card.find({}).select('wbs').sort({wbs: 'desc'}).exec();
            if(getCurrentWBS && getCurrentWBS.length > 0) {
                const [highestWbs] = getCurrentWBS || [];
                if(highestWbs.wbs){
                    const firstIndex = +(highestWbs.wbs.split('.')[0]);
                    const res = (firstIndex + 1).toString() + '.' + highestWbs.wbs.split('.')[1];
                    return res;
                } 
            }  
            return '1.0';
           
        }
        else  {
            const getParentWbs = await Card.find({parentCard: parentCard}).select('wbs').sort({wbs: 'desc'}).exec();
            if(getParentWbs && getParentWbs.length === 0) {
                    const getCurrentWBS = await Card.find({}).select('wbs').sort({wbs: 'desc'}).exec();
                    if(getCurrentWBS && getCurrentWBS.length > 0) {
                        const [highestWbs] = getCurrentWBS || [];
                        if(highestWbs.wbs){
                            const firstIndex = +(highestWbs.wbs.split('.')[0]);
                            const res = (firstIndex + 1).toString() + '.' + '1';
                            return res;
                        } 
                    }  
                } else {
                    const [highestWbss] = getParentWbs || [];
                    const current = highestWbss.wbs.split('.')[0];
                    let next = highestWbss.wbs.split('.')[1];
                    next = ++next;
                    return current + '.' + next;
                }
               
         
        }
    }  

    create = async (req, res) => {
        // validate request
        if (!req.body) {
            res.status(400).send({ message: "Content can not be emtpy!" });
            return;
        }
        const params = this.filterParams(req.body, this.whitelist);
        // new card
        const wbs = await this.populateWBS(params);
        console.log('updated wbs', wbs);
        // return res.status(200).json({msg: 'tep'})

        const card = new Card({
            ...params,
            userId: req.user.id,
            wbs: wbs,
        })
      
        // save card in the database
        const newCard = await card.save(card);
        if(!params.parentCard) {
            
           const makeSelfParent = await Card.findByIdAndUpdate({_id: newCard._id}, {parentCard: newCard._id}, {new: true}).exec();
           return res.status(200).json({ message: 'Card has been created successfully', success: true, details: makeSelfParent });
        }
        if (newCard) {
            return res.status(200).json({ message: 'Card has been created successfully', success: true, details: newCard });
        }
        return res.status(200).json({ message: 'Issue with card creation', success: false})
    }

    // retrieve and return all card/ retrive and return a single card
    findAll = async (req, res) => {
          const userId = req.user.id;
          const cards = await Card.find({userId: userId});
          if (cards) {
              return res.status(200).json({ message: 'card fetched successfully', details: cards });
          }
          return res.status(200).json({ message: 'issue with card fetching' })

    }

    // Update a new idetified card by card id
    update = async (req, res) => {
      
        if (!req.body) {
            return res
                .status(400)
                .send({ message: "Data to update can not be empty" })
        }

        const { id } = req.query;
        let wbs = '';
        let updatedObj = {};

        if(req.body.parentCard) {
            wbs = await this.populateWBS(req.body);
            console.log('adaddd', wbs, req.body)
            updatedObj = {...req.body, wbs: wbs}
        } else  {
            updatedObj = {...req.body }
        }
    
        Card.findByIdAndUpdate(id, updatedObj, { useFindAndModify: false, new: true})
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
        const { id } = req.query;
        console.log('id', id);
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