import { StyleSheet } from 'react-native';

const Styling = StyleSheet.create({
  title:{
    color: "gold",
    padding: 20,
    textAlign: "center",
    fontWeight: "800",
  },

  textInput:{
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },

  button:{
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },

  buttonText:{
    color: 'white',
    textAlign: 'center',
  },

  centerMyChildren:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  centerThisChildOfCMC:{
    alignSelf:"center"
  },

  centerText:{
    textAlign: "center"
  },

  creditCtrVizible:{
    backgroundColor: "#00000083", 
    borderRadius: 99, 
    fontWeight: "bold", 
    textAlign: "center", 
    color: "gold",
    paddingHorizontal: "3%"
  }, 

  creditCtrNotViz:{
    textAlign: "center", 
    color: "transparent"
  },

  popOutBox: {
    justifyContent:"center", 
    alignItems:"center", 
    position:"absolute", 
    left:"15%", 
    top:"63%", 
    width:"70%"
  },

  glowingText:{
    shadowColor: '#FFD700', // gold glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 12, // Android glow
  },

});

export default Styling;
