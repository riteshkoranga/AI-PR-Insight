require("dotenv").config();
const express = require("express");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./model/user");

const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["repo"],
    },
    async(accessToken, refreshToken, profile, done) => {

        try{
            const user=await User.findOneAndUpdate(
                { githubId: profile.id },
                {
                  githubId: profile.id,
                  username: profile.username,
                  token: accessToken,
                },
                { upsert: true, new: true },
                
              );
              done(null,user);
        }catch(err){
            done(err);
        }
      
    }
  )
);


app.use(express.static(__dirname)); 

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.use("/auth", require("./routes/auth"));
app.use("/webhook", require("./routes/webhook"));

app.listen(3000, () => console.log("Server started on http://localhost:3000")); 