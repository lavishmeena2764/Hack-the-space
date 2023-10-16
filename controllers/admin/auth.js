const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

exports.signup = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(
      async (user) => {
        if (user)
          return res.status(400).json({
            message: "User already registered",
          });

        const { firstName, lastName, email, password, contactNumber, linkedinLink, githubLink } = req.body;
        const hash_password = await bcrypt.hash(password, 10);
        const _user = new User({
          firstName,
          lastName,
          email,
          hash_password,
          contactNumber,
          linkedinLink,
          githubLink
        });

        _user.save()
          .then((data) => {


            if (data) {

              let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                post: 587,
                security: false,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASS
                }
              });
              var message = "You have successfully registered for Hack the Space hackathon"
              var name = data.firstName + " " + data.lastName
              var mailOptions = {
                from: 'Hack the Space',
                to: data.email,
                subject: "User registeration mail for " + name,
                html: `${message}`
              }

              transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                  res.json({
                    status: err
                  })
                  console.log(err)
                } else {
                   res.status(201).json({
                    status: "User registered Successfully..!"
                  })
                  console.log("email sent " + data.response)
                }
              })


            }
          })
          .catch((error) => {
            return res.status(400).json({
              message: "Something went wrong",
              error: error
            });
          })
      });
};

exports.signin = (req, res) => {
  User.findOne({ email: req.body.email })
    .then(
      (user) => {
        if (user) {
          const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET
          );
          const { _id, firstName, lastName, email, contactNumber, linkedinLink, githubLink } = user;
          res.cookie("token", token);
          res.status(200).json({
            token,
            user: { _id, firstName, lastName, email, contactNumber, linkedinLink, githubLink },
          });
        } else {
          return res.status(400).json({
            message: "Invalid Password",
          });
        }

      })
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Signout successfully...!",
  });
};
