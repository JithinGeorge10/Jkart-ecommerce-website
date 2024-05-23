const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: "https://jkart.online/google/callback",
    passReqToCallback: true
},
    async function (request, accessToken, refreshToken, profile, done) {
      
        return done (null,profile)
    }
));

passport.serializeUser(function (user, done) {
    done(null, user)
})

passport.deserializeUser(function (user, done) {
    done(null, user)
})