import {
  container,
  card,
  cardHeader
} from "../../../assets/jss/material-kit-react.js";

console.log('card=', card, container)
const componentsStyle = (theme) => ({
  container,
  card: {
    ...card,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    textAlign: "center",
    marginBottom: 24,
    padding: "32px 16px",
    backgroundColor: "rgb(39,31,114)",
    color: "#fff",
    borderRadius: 6,
    width: 'auto'
  },
  header: cardHeader,
  img: {
    width: '35px',
    padding: 4
  },
  actionArea: {
    paddingLeft: 10,
    border: '1px solid',
    borderRadius: 4
  },
  avatar: {
    backgroundColor: '#f44336'
  },
  expand: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  optMultiImgWrapper: {
    height: "20px",
    display: 'inline-block',
    whiteSpace: 'nowrap',
    verticalAlign: 'sub'
  },
  optMultiImg: {
    width: "auto",
    height: "20px",
    borderRadius: "50%",
    marginLeft: "-5px",
    "&:first-child": {
      marginLeft: 0
    },
    "&:last-child": {
      marginRight: "8px"
    }
  },
});

export default componentsStyle;