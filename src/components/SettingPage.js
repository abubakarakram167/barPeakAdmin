import {
  CRow,
  CCol,
  CContainer,
  CFormGroup,
  CLabel,
  CInput,
  CFormText,
  CForm,
  CTextarea,
  CButton
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
    
    if(validate()){
      const body = {
        noOfscheduleEventInAWeek: allDays.filter(day => day.select === true).map(day => day.value),
        scheduleStartTime: moment(formData.scheduleStartTime).format('HH:mm'),
        scheduleEndTime: moment(formData.scheduleEndTime).format('HH:mm'),
        rating: ratingData,
        noOfUsersUntilShowDefault: formData.noOfUsersUntilShowDefault
      }

      try{
        let errors = {};
        const {data} = await axios.post(`/setScheduleEvent`, body)
        console.log("after the res starting schedule", data);
        errors["endScheduleTime"] = null
        if(data.data.isScheduleApply){
          setMessage("Schedulling Start Successfully")
          setSuccess(true)
          setShowPopup(true)
          setIsRunning(true)
        }
        else{
          setMessage("Schedulling Could not Start Successfully")
          setSuccess(true)
          setShowPopup(true)
          setIsRunning(false)
        }
      
      }catch(err){
        console.log("the error below", err.response) 
        setShowPopup(true)
        setMessage("Schedulling Not SuccessFully Start")
        setSuccess(false);
      }
    }
    
  }
  
  const onChangeStartTime = (event) => {
    const date = moment(event).format('HH:mm')
    console.log("the date", date)
    const startDateAndTime = date.split(':');
    let formDataState = formData;
    const formDatatTransform = {...formDataState, scheduleStartTime: moment().set("hour", startDateAndTime[0]).set("minute", startDateAndTime[1]) }
    setFormData( formDatatTransform );
  }

  const onChangeEndTime = (event) => {
    const date = moment(event).format('HH:mm')
    console.log("the date", date)
    const startDateAndTime = date.split(':');
    let formDataState = formData;
    const formDatatTransform = {...formDataState, scheduleEndTime: moment().set("hour", startDateAndTime[0]).set("minute", startDateAndTime[1]) }
    setFormData( formDatatTransform );
  }

  const stopSchedule =async() => {
    try{
      const {data} = await axios.post(`/stopScheduleEvent`);
      console.log("after stopping the schedulle event the response", data)
      if(!data.data.isScheduleApply ){
        setMessage("Schedulling Stop Successfully")
        setSuccess(true)
        setShowPopup(true)
        setIsRunning(false)
      }
      else{
        setMessage("Schedulling Do not Stop Successfully")
        setShowPopup(true)
        setIsRunning(false)
        setSuccess(false);
      }
    }catch(err){
      setMessage("Schedulling Do not Stop Successfully")
      setShowPopup(true)
      setIsRunning(false)
      setSuccess(false);
      console.log("the error", err)
    }
  }

  const onChangeWeek = (e) => { 
    let allDaysData = allDays.map((day)=> {
      if(parseInt(day.value) === parseInt(e)){
        let whatToSelect = false;
        console.log("the e", e)
        if(day.select === false)
          whatToSelect = true
        return{...day, select: whatToSelect}
      }
      return day
    })
    console.log("the allDaa", allDaysData)
    setAllDays(allDaysData)
  }

  useEffect(() => {
    const fetchData = async() => {
      try{
        const getDefaultSettings = await axios.get('/getdefaultSettings');
        const settings = getDefaultSettings.data.settings;
        console.log("the settings", settings)
        setRatingData(settings.rating)        

        let activeDays =  allDays.map((day)=> {
          if( settings.noOfscheduleEventInAWeek.includes(parseInt(day.value)))
            return {...day, 
              select: true  
            }
          else
            return day     
        })
        const startDateAndTime = settings.scheduleStartTime.split(':');
        const endDateAndTime = settings.scheduleEndTime.split(':');
        setFormData({ 
          scheduleStartTime: moment().set("hour", startDateAndTime[0]).set("minute", startDateAndTime[1]),
          scheduleEndTime: moment().set("hour", endDateAndTime[0]).set("minute", endDateAndTime[1]),
          noOfUsersUntilShowDefault: settings.noOfUsersUntilShowDefault 
        });
        setIsRunning(settings.isScheduleApply)
        setAllDays(activeDays)
       
        
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
                <CLabel className = "labelText">Start Schedule Time </CLabel>
                <TimePicker
                  value = { formData.scheduleStartTime }
                  placeholder = "SelectTime"
                  onChange = { onChangeStartTime }
                  showSecond = {true}
                />
              </CFormGroup>
              <CFormGroup>
                <CLabel className = "labelText">End Schedule Time </CLabel>
                <TimePicker
                  value = { formData.scheduleEndTime }
                  placeholder = "SelectTime"
                  onChange = { onChangeEndTime  }
                  showSecond = {true}
                  
                />
                { error.endScheduleTime && <CFormText className = "show-error-message" color = "white" > Ending Time Should Be greater Than Starting Time.</CFormText> }     
              </CFormGroup>
              <p style = {{ fontSize: 20 }} >Weekly Default Rating Setting:</p>
              <CFormGroup>
                <CLabel className = "labelText">Weekly Schedule </CLabel>
                {
                   allDays && allDays.map((weekDay, index)=> {
                    return (
                      <span
                        index={ index } 
                        onClick={ ()=> onChangeWeek(weekDay.value) } 
                        className = { !weekDay.select ? "nonActiveweekDayNames" : "activeWeekDayNames" } 
                      > 
                        { weekDay.name }
                      </span>
                    )  
                  })
                }
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
            style = {{ textAlign: 'center' }}
          > 
            {  !isRunning ?
              <div>
                 <p className = "schedule-text" > Schedule is not Active. </p>
                <CButton
                  style = {{ marginBottom: 50, textAlign: 'center' }}
                  color = "info"
                  onClick = {()=>{ submitForm()  }}
                >
                  Start Scheduling
                </CButton> 
               
              </div>
              :
              <div>
                <p className = "schedule-text" > Schedule is Active. </p>
                <CButton
                  style = {{ marginBottom: 50, textAlign: 'center' }}
                  color = "danger"
                  onClick = {()=>{ stopSchedule()  }}
                >
                  Stop Scheduling
                </CButton>     
              </div>
            }
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}