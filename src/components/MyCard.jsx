import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import CircularProgress from "@material-ui/core/CircularProgress";
import { createMuiTheme } from "@material-ui/core/styles";
import { withTheme } from "@material-ui/core/styles";
import Refresh from "@material-ui/icons/Refresh";
import "./styles.css";

const UPDATE_RATE = 5; // In Minutes

const urls = [
  "https://eu.api.battle.net/data/wow/token/?namespace=dynamic-eu&locale=en_GB&access_token=API_KEY_HERE",
  "https://us.api.battle.net/data/wow/token/?namespace=dynamic-us&locale=en_US&access_token=API_KEY_HERE"
];

const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2
  },
  card: {
    maxWidth: 400
  },
  media: {
    height: 0,
    paddingTop: "56.25%" // 16:9
  },
  actions: {
    display: "flex"
  },
  expand: {
    transform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    }),
    marginLeft: "auto"
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  avatar: {
    backgroundColor: red[500]
  },
  progress: {
    margin: theme.spacing.unit
  },
  icon: {
    margin: theme.spacing.unit,
    fontSize: 24
  }
});

class MyCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingEU: true,
      loadingUS: true,
      priceEU: "",
      priceUS: "",
      lastUpdatedEU: "",
      lastUpdatedUS: "",
      lastUpdate: 0,
      remaining: ""
    };
  }

  updateTimer = () => {
    let before = this.state.lastUpdate;
    let now = new Date();
    let after = new Date(before.valueOf() + UPDATE_RATE * 60000);
    let rem = new Date(after.valueOf() - now.valueOf());
    let minutes = rem.getMinutes();
    let seconds = rem.getSeconds();
    let result = minutes + "m " + seconds + "s ";
    this.setState({ remaining: result });
  };

  handleRefresh = () => {
    this.fetchPrices();
  };

  fetchPrices = () => {
    // this.setState({ loadingEU: true, loadingUS: true });
    Promise.all([
      fetch(urls[0]).then(data => data.json()).then(result => {
        let price = numberWithCommas(copperToString(result.price));

        this.setState({
          loadingEU: false,
          priceEU: price,
          lastUpdatedEU: new Date(
            result.last_updated_timestamp
          ).toLocaleString(),
          lastUpdate: new Date()
        });
      }),
      // .catch(err => console.log(`Error: ${err}`)),

      fetch(urls[1])
        .then(data => data.json())
        .then(result => {
          let price = numberWithCommas(copperToString(result.price));

          this.setState({
            loadingUS: false,
            priceUS: price,
            lastUpdatedUS: new Date(
              result.last_updated_timestamp
            ).toLocaleString()
          });
        })
        .catch(err => console.log(`Error: ${err}`))
    ]).then(() => {
      this.updateTimer();
      clearInterval(this.updateTimer);
      setInterval(this.updateTimer, 1000);
    });
  };

  componentDidMount() {
    this.fetchPrices();
    setInterval(this.fetchPrices, UPDATE_RATE * 60000);
  }

  render() {
    const { classes } = this.props;
    const { loadingEU, loadingUS } = this.state;

    return (
      <div>
        <Card className={classes.card}>
          <CardMedia
            className={classes.media}
            image="/token.jpg"
            title="Contemplative Reptile"
          />
          <CardContent>
            <Typography gutterBottom variant="display1" component="h1">
              WoW Token Prices{" "}
              <Refresh
                id="refresh"
                className={classes.icon}
                onClick={this.handleRefresh}
              />
            </Typography>
            <Typography gutterBottom component="p">
              {!this.state.remaining
                ? "Updated every " + UPDATE_RATE + " minutes."
                : "Updated every " +
                  UPDATE_RATE +
                  " minutes. Next update in " +
                  this.state.remaining}
            </Typography>
            <br />

            <Paper className={classes.root} elevation={1}>
              {loadingEU
                ? <CircularProgress size="1.5em" className={classes.progress} />
                : <div>
                    <Typography gutterBottom variant="headline">
                      {this.state.price !== "" &&
                        "EU Token: " + this.state.priceEU}
                    </Typography>
                    <Typography gutterBottom variant="subheading">
                      {this.state.lastUpdated !== "" &&
                        "Last updated: " + this.state.lastUpdatedEU}
                    </Typography>
                  </div>}
            </Paper>
            <Paper className={classes.root} elevation={1}>
              {loadingUS
                ? <CircularProgress size="1.5em" className={classes.progress} />
                : <div>
                    <Typography gutterBottom variant="headline">
                      {this.state.price !== "" &&
                        "US Token: " + this.state.priceUS}
                    </Typography>
                    <Typography gutterBottom variant="subheading">
                      {this.state.lastUpdated !== "" &&
                        "Last updated: " + this.state.lastUpdatedUS}
                    </Typography>
                  </div>}
            </Paper>
          </CardContent>

          {/* <CardActions>
            <Button size="small" color="primary">
              Share
            </Button>
            <Button size="small" color="primary">
              Learn More
            </Button>
          </CardActions> */}
        </Card>
      </div>
    );
  }
}

const copperToString = copp => {
  let price = copp.toString();
  let gold = Number(price.toString().substr(0, price.length - 4));
  let silver = Number(price.substr(price.length - 4, 2));
  let copper = Number(price.substr(price.length - 2, 2));
  return `${gold}g ${silver}s ${copper}c`;
};

const numberWithCommas = x => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

MyCard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withTheme(theme)(withStyles(styles)(MyCard));
