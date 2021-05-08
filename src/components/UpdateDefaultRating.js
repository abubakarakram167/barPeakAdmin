import {
  CRow,
  CCol,
  CContainer,
  CFormGroup,
  CLabel,
  CForm,
  CButton,
 } from '@coreui/react'
import axios from '../api';
import { useState, useEffect } from 'react';
import { getUserData } from '../localStorage';
import { Rating } from '@material-ui/lab';
import _, { map } from 'underscore';
import Modal from './Modal';
import 'intl-tel-input/build/css/intlTelInput.css';
import './SettingPage.css';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import moment from 'moment';
import { Alert } from 'antd';

export default (props) => {
  
  const [formData, setFormData] = useState({ });
  const [ratingData, setRatingData] = useState(null);
  
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const [error, setError] = useState({})
  const [message, setMessage] = useState(''); 
  const [currentGenderBreakDown, setCurrentGenderBreakDown] = useState("Equal Girls and Guys")
  const [ isRunning, setIsRunning] = useState(false)
  const [ isCurrentDefault ,setIsCurrentDefault ] = useState("true");

  const [allDays, setAllDays] = useState([
    { name: "Sun", value: 0 , select: false} ,
    { name: "Mon", value: 1, select: false } ,
    { name: "Tue", value: 2, select: false },
    { name: "Wed", value: 3 , select: false},
    { name: "Thur", value: 4, select: false },
    { name: "Fri", value: 5, select: false },
    { name: "Sat", value: 6, select: false }
  ])

  const onChange = (event) => {
    const { name, value } = event.target; 
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  const getGenderBreakDownValue = (value) => {
    console.log("the value", value)
    let genderBreakDownValue ;
    if(parseInt(value) === 1)
      genderBreakDownValue = "Equal Girls and Guys";
    else if (parseInt(value) === 2 )
      genderBreakDownValue = "More Guys than Girls";
    else
      genderBreakDownValue = "More Girls than Guys";
    
    console.log("the gender breakdown", genderBreakDownValue)  
    return genderBreakDownValue;
  }
   
  const onChangeRating = (event) => {
    const { name, value } = event.target;
    if(name === "ratioInput")
      setCurrentGenderBreakDown(getGenderBreakDownValue(value))      
    setRatingData(prevState => ({ ...prevState, [name]: value }));
  }

  const validate = () => {
    let errors = {}
    let isValid = true;

    console.log("the momnent", formData.scheduleStartTime.isBefore(formData.scheduleEndTime))

    if(!formData.scheduleStartTime.isBefore(formData.scheduleEndTime)){
      isValid = false;
      errors["endScheduleTime"] = " End Schedule Time Should Be Greater Than Starting Time."
    }
    
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  
  const submitForm = async () => {
  
    const body = {
      rating: ratingData,
      noOfUsersUntilShowDefault: formData.noOfUsersUntilShowDefault,
      isCurrentDefault
    }

    try{
      const {data} = await axios.post(`/setDefaultSettings`, body);
      // debugger;
      if(data.data){ 
        setMessage("Rating Successfully Updated")
        setSuccess(true)
        setShowPopup(true)
      }
    }catch(err){
      console.log("the error below", err.response) 
      setShowPopup(true)
      setMessage("Rating Not SuccessFully Update")
      setSuccess(false);
    } 
  }

  useEffect(() => {
    const fetchData = async() => {
      try{
        const getDefaultSettings = await axios.get('/getdefaultSettings');
        const settings = getDefaultSettings.data.settings;
        setRatingData(settings.rating)        
        setIsCurrentDefault(settings.isCurrentDefault ? "true" : "false");
        setFormData({ 
          noOfUsersUntilShowDefault: settings.noOfUsersUntilShowDefault 
        });
      }catch(err){
        console.log("the error", err);
      }
    }
    fetchData();
  }, []);

 
  return(
    <div>
      <CContainer className = "form-container-width"  >
        <CRow>
          <Modal 
            showPopup = {showPopup} 
            success = {success} 
            history = {props.history} 
            message = {message} 
            notRedirect = {true}
            closeModal = {()=> setShowPopup(false)}
          />
        </CRow>
        <CRow>
          <CCol sm="12">
            <CForm onSubmit={submitForm} >
              <CFormGroup>
                <CLabel className = "labelText" >No Of Users </CLabel>
                <input 
                  type="number"
                  name="noOfUsersUntilShowDefault" 
                  id="NoOfUsers" 
                  value = { formData.noOfUsersUntilShowDefault }
                  placeholder="Enter A No Of Users" 
                  required
                  onChange = { onChange } 
                />
                {error.noOfUsersUntilShowDefault &&  <Alert message = {error.noOfUsersUntilShowDefault}  type="error" />  }
              </CFormGroup>
              <CFormGroup>
                <CLabel className = "labelText" > Default </CLabel>
                <div 
                  onChange={(e) => {
                    console.log("the clicked", e.target.value)
                    console.log("the casad", isCurrentDefault)
                    setIsCurrentDefault(e.target.value)
                  }}
                >
                  <input onClick = {(e)=> { setIsCurrentDefault(e.target.value) }} type="radio" checked = { isCurrentDefault === "true" ? true : false } value = {"true"} name="currentDefault"/> Yes
                  <input onClick = {(e)=> { setIsCurrentDefault(e.target.value) }} style = {{ marginLeft: 20 }} type="radio" checked = { isCurrentDefault === "false" ? true : false }  value = {"false"} name="currentDefault"/> No
                </div>
              </CFormGroup>     
              <p style = {{ fontSize: 20 }} >Default Rating:</p>
              { ratingData &&
                (<CFormGroup>
                  <CLabel style = {{ fontSize: 20 }} > Fun :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    { ratingData.fun &&
                    <Rating 
                      name="fun" 
                      value = { ratingData.fun   } 
                      onChange = { onChangeRating } 
                      size="large" 
                      max = {5} 
                    /> }
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} > { ratingData.fun } </span>
                  <hr />

                  <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
              
                    <Rating 
                      name="crowd" 
                      value = { ratingData.crowd }  
                      onChange = {onChangeRating } 
                      size="large" 
                      max = {5} 
                    />
                  
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.crowd }</span>
                  <hr />        
                  <CLabel style = {{ fontSize: 20 }} > Gender BreakDown :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating 
                      name="ratioInput" 
                      value={ratingData.ratioInput} 
                      onChange = {onChangeRating} 
                      size="large" 
                      max = {3} 
                    />
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.ratioInput }</span>
                  <CButton
                    className = "gender-breakdown-button"  
                  >
                    {currentGenderBreakDown}
                  </CButton> 
                  <hr />
                  <CLabel style = {{ fontSize: 20 }} > difficultyGettingIn :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating 
                      name = "difficultyGettingIn" 
                      value = { ratingData.difficultyGettingIn }  
                      onChange = {onChangeRating} 
                      size="large" 
                      max = {5} 
                    />
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.difficultyGettingIn }</span>
                  <hr />

                  <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating name = "difficultyGettingDrink" value = { ratingData.difficultyGettingDrink  }  onChange = {onChangeRating} size="large" max = {4} />
                  </span>  
                  <span style = {{ marginLeft: 10, fontSize: 20 }} > { ratingData.difficultyGettingDrink } </span>   
                </CFormGroup>)
              }
            </CForm>
          </CCol>
        </CRow>
        <CRow>
          <CCol
            style = {{ textAlign: 'left' }}
          >  
            <div>
              <CButton
                style = {{ marginBottom: 50, textAlign: 'center' }}
                color = "info"
                onClick = {()=>{ submitForm()  }}
              >
                Update 
              </CButton>        
            </div>
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}