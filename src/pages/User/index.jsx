import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// react components for routing our app without refresh
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
// core components
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import Parallax from "../../components/Parallax/Parallax";
// sections for this page
import HeaderLinks from "../../components/Header/HeaderLinks";
import CustomTabs from "../../components/CustomTabs/CustomTabs";
import CustomInput from "../../components/CustomInput/CustomInput";
import Button from "../../components/CustomButtons/Button";
import Muted from "../../components/Typography/Muted";

import styles from "./style";

const useStyles = makeStyles(styles);

export default function Page3(props) {
  const classes = useStyles();
  const { ...rest } = props;

  const [checkedA, setCheckedA] = React.useState(true);

  return (
    <div>
      <Header
        brand="Piggy.Finance"
        rightLinks={<HeaderLinks />}
        fixed
        color="transparent"
        changeColorOnScroll={{
          height: 400,
          color: "white",
        }}
        {...rest}
      />
      <Parallax image={require("./images/bg-1.jpg")}>
        <div className={classes.container}>
          <GridContainer>
            <GridItem>
              <div className={classes.brand}>
                <h2 className={classes.subtitle}>
                  Deposits: $123124343
                </h2>
                <h2 className={classes.subtitle}>
                  price: 1.024255
                </h2>
              </div>
            </GridItem>
          </GridContainer>
        </div>
      </Parallax>
      <div id="sliders" className={classNames(classes.main, classes.mainRaised)}>
        <GridContainer className={classNames(classes.center)}>
          <GridItem xs={12} sm={12} md={8}>
            <CustomTabs
              headerColor="primary"
              tabs={[
                {
                  tabName: 'USDT',
                  // tabIcon: () => <image src='https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png' />,
                  tabContent: (
                    <GridContainer>
                      <GridItem xs={12} sm={12} md={6} lg={6}>
                        <CustomInput
                          labelText="Balance: 10000"
                          inputProps={{
                            placeholder: "Please input a deposit amount",
                            endAdornment: <a>Max</a>
                          }}
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6} lg={6}>
                        <CustomInput
                          labelText="Balance: 20000"
                          inputProps={{
                            placeholder: "Please input a withdraw amount",
                            endAdornment: <a>Max</a>
                          }}
                          formControlProps={{
                            fullWidth: true
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={12} md={6} lg={6} />
                      <GridItem xs={12} sm={12} md={6} lg={6}>
                        <GridContainer>
                          <GridItem xs={6} sm={6} md={6} lg={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={checkedA}
                                  onChange={(event) => setCheckedA(event.target.checked)}
                                  value="checkedA"
                                  classes={{
                                    switchBase: classes.switchBase,
                                    checked: classes.switchChecked,
                                    thumb: classes.switchIcon,
                                    track: classes.switchBar,
                                  }}
                                />
                              }
                              style={{ paddingTop: 24 }}
                              classes={{
                                label: classes.label,
                              }}
                              label={<Muted>{checkedA ? "开启兑换" : "关闭兑换"}</Muted>}
                            />
                          </GridItem>
                          <GridItem xs={6} sm={6} md={6} lg={6}>
                            <CustomInput
                              labelText="Max Loss"
                              inputProps={{
                                placeholder: "Allow loss percent",
                                endAdornment: <a>Max</a>
                              }}
                              formControlProps={{
                                fullWidth: true
                              }}
                            />
                          </GridItem>
                        </GridContainer>
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6} lg={6}>
                        <Button color="primary" >Deposit</Button>
                      </GridItem>
                      <GridItem xs={6} sm={6} md={6} lg={6}>
                        <Button color="primary" >Withdraw</Button>
                      </GridItem>
                    </GridContainer>
                  ),
                }
              ]}
            />
          </GridItem>
        </GridContainer>
      </div>
      <Footer />
    </div>
  );
}
