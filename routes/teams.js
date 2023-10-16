const express = require('express');
const router = express.Router();
const Team = require('../models/team');
const { requireSignin } = require('../common-middleware');


//get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find({});
        // res.render("teams/index",{teams});
        res.json(teams)
    } catch (error) {
        console.log(error)
    }
});

// make a new team
router.post('/', requireSignin, async (req, res) => {
    const { name } = req.body;
    try {
        const team = new Team({ name, createdBy: req.user._id, members: [req.user._id] });
        await team.save()
            .then((team) => {
                if (team) {
                    return res.status(201).json({
                        message: "Team registered Successfully..!",
                    });
                }
            })
    } catch (error) {
        console.log(error)
    }
})
//add a member page

/* router.get("/new", (req, res) => {
    try {
        res.render("teams/new")
    } catch (error) {
        console.log(error);
    }
}) */

//join a team

router.put("/:id/join", requireSignin, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
        if (!team) { return res.status(401).res("Team not Found") }
        const updatedTeam = await Team.findByIdAndUpdate(req.params.id, { $push: { members: req.user } }, { new: true })
        res.json(updatedTeam)
    } catch (error) {
        console.log(error.message)
        res.status(500).json("Internal server Error")
    }
});

//leave a team
router.put("/:id/leave", requireSignin, async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
        if (!team) { return res.json({ error: "team not found" }) }
        if (req.user._id == team.createdBy) { return res.json({ error: "team leader can not leave" }) }
        else {
            const updatedTeam = await Team.findByIdAndUpdate(req.params.id, { $pull: { members: req.user._id } }, { new: true })
            res.json(updatedTeam)
        }
    } catch (error) {
        console.log(error.message)
    }
});
router.delete("/:id", requireSignin, async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findById(id)
        console.log(req.user._id);
        console.log(team.createdBy);
        if (req.user._id == team.createdBy) {
            const team = await Team.findByIdAndDelete(id)
            .then(()=>{
                return res.json({message:"team deleted successfully"})
            })
            //   res.redirect("/teams");
        }else{
            return res.json({error:"only leader can delete the team"})
        }
    } catch (error) {
        console.log(error)
    }
})

module.exports = router;