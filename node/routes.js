var jsonParser = require('../util/stringToJson.js');
var fs = require('fs');

module.exports = function (app) {
    //Checks if a session exists: if so, redirect to dashboard; else, continue
    var authRedirDash = (req, res, next) => {
        if (req.session.authenticated) {
            res.redirect('/dashboard');
        } else {
            next();
        }
    }

    var authRedirLogin = (req, res, next) => {
        if(!req.session.authenticated) {
            res.redirect('/login');
        } else {
            next();
        }
    }

    //Route for login page
    app.route('/login')
        .get(authRedirDash, (req, res) => {
            var data = {title: 'Log in', user: 'Not signed in'};
            res.render('login', data);
        })
        .post((req, res) => {
            var username = req.body.username;
            var password = req.body.password;
            var json = jsonParser('../users.json');
            var validAuth = false;
            for (var i = 0; i < json.users.length; i++) {
                if (username == json.users[i].username && password == json.users[i].password) {
                    validAuth = true;
                    req.session.authenticated = true;
                    req.session.username = username;
                    res.redirect('/dashboard');
                }
            }

            if (validAuth == false) {
                res.redirect('/login');
            }
        });

    //Home page redirect to login
    app.get('/', authRedirDash, (req, res) => {
        res.redirect('/home');
    });

    //Route for dashboard
    app.get('/dashboard', (req, res) => {
        if (req.session.authenticated) {
            res.render('dashboard', {title: 'Dashboard', user: req.session.username});
        } else {
            res.redirect('/login');
        }
    });

    app.route('/form')
        .get(authRedirLogin, (req, res) => {
            res.render('matchSelect', {title: 'Select Match #', user: req.session.username});
        })
        .post((req, res) => {
            var matchNum = req.body.matchNum;
            var teams = [];
            var json = jsonParser('../matches.json');
            var foundMatch = false;
            for(var i=0; i<json.matches.length; i++) {
                if(matchNum == json.matches[i].matchNum) {
                    teams.push(json.matches[i].red1,
                        json.matches[i].red2,
                        json.matches[i].red3,
                        json.matches[i].blue1,
                        json.matches[i].blue2,
                        json.matches[i].blue3);
                    foundMatch = true;
                    break;
                }
            }
            if(!foundMatch) {
                res.redirect('/form');
            } else {
                var config = jsonParser('../formConfig.json');
                res.render('form', {title: 'Match '+matchNum, matchNum: matchNum, user: req.session.username, teams: teams, config: config});
            }
        });

    app.post('/submitForm', (req, res) => {
        var json = JSON.stringify(jsonParser('../matches.json'));
        var form = ',\n{"matchNum":"'+req.body.match_num+'","teamNum":"'+req.body.team_num+'"}';
        var config = jsonParser('../formConfig.json');
        for (var i=0; i<config.fields.length; i++) {
            form = form.substring(0,form.length-1)+'"'+config.fields[i].id+'":"'+req.body[config.fields[i].id]+'"'+'}';
        }
        json = json.substring(0,json.length-2)+form+"]}";
        console.log(json);
        fs.writeFile("../matches.json",json,function(err) {
            if(err) {
                return console.log(err);
            }
        });

        res.redirect('/dashboard');
    });

    //Route for logout
    app.get('/logout', (req, res) => {
        if (req.session.authenticated) {
            delete req.session.authenticated;
            delete req.session.username;
        }
        res.redirect('/home');
    });

    //Route for home page
    app.get('/home', (req, res) => {
        var data;
        if (req.session.authenticated) {
            data = {title: 'Home', user: req.session.username, status: ''};
        } else {
            data = {title: 'Home', user: 'Not signed in', status: 'not '};
        }
        res.render('home', data);
    });

    //Route for 404s
    app.use(function (req, res, next) {
        res.status(404).send("Not found");
    });
}