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
import axios from '../../api';
import { useState, useEffect } from 'react';
import { getUserData } from '../../localStorage';
import { Rating } from '@material-ui/lab';
import _, { map } from 'underscore';
import Modal from '../../components/Modal';
import { Alert } from 'antd';
import { Row, Col } from 'antd';
import BusinessCarousel from '../Business/BusinesCarousel';
import Widget from '../../components/Widget';
import './formContainer.css';
import moment from 'moment';

const weekDays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const hoursPerDay = [
  "0000", "0030","0100","0130","0200","0230",
  "0300","0330","0400","0430","0500","0530",
  "0600","0630","0700","0730","0800","0830",
  "0900","0930","1000","1030","1100","1130",
  "1200","1230","1300","1330","1400","1430",
  "1500","1530","1600","1630","1700","1730",
  "1800","1830","1900","1930","2000","2030",
  "2100","2130","2200","2230","2300","2330"
]

export default (props) => {
  
  const [allCateogories, setCategories]=useState([]);
  const [isBar, setBar]=useState(false);
  const [formData, setFormData] = useState({ uploadedPhotos: [], newPhotos: [] });
  const [ratingData, setRatingData] = useState(null);
  const [googleDetailData, setGoogleDetailData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const [error, setError] = useState({})
  const [customField, setCustomField] = useState(false);
  const [specificBusinessCategory, setSpecificBusinessCategory] = useState([]);
  const [currentGenderBreakDown, setCurrentGenderBreakDown] = useState("Equal Girls and Guys");
  const selectedcategoryIds = []
  const [openingHoursFormat, setOpeningHoursFormat] = useState([]);
  const [openingHours, setOpeningHours] = useState([]);
  const [ currentWeekDayName, setCurrentWeekDayName ] = useState('');
  const [ currentOpenTime, setCurrentOpenTime ] = useState('');
  const [ currentCloseTime, setCurrentCloseTime ] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    if(name === "category"){
      const specificCategory = allCateogories.filter(category => category._id === value)[0]
      if(specificCategory.title === "bar")
        setBar(true)
      else
        setBar(false) 
    }
     
    setFormData(prevState => ({ ...prevState, [name]: value }));
  }

  const onChangeCategory = (event) => {
    const { value } = event.target;
    let selectedcategoryIds = formData.category;
    
    if(selectedcategoryIds.includes(value)){
      selectedcategoryIds = selectedcategoryIds.filter( id => id !== value )
    }
    else
      selectedcategoryIds.push(value)  
   
    const specificCategory = allCateogories.filter(category => selectedcategoryIds.includes(category._id)).map(category => category._id) 
    const barCategoryTitle = allCateogories.filter(category => selectedcategoryIds.includes(category._id) ).map(category => category.title)
    
    if( barCategoryTitle.includes("Bar") )
      setBar(true)
    else
      setBar(false) 
    
    setFormData(prevState => ({ ...prevState, category: specificCategory }));
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
   
    if(formData.name === "" || formData.name === undefined){
      isValid = false;
      errors["title"] = "Please input title"
    }
    if(formData.category === "" || formData.category === undefined){
      isValid = false;
      errors["category"] = "Please input category"
    }
    
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  const getPhotos = () => {
    let totalPhotos = ''
    if(formData.uploadedPhotos.length>0){
      formData.uploadedPhotos.map((photo)=>{
        totalPhotos = totalPhotos + photo.secure_url  + ','
      })
    }
    else if(formData.newPhotos.length> 0){
      formData.newPhotos.map((photo)=>{
        totalPhotos = totalPhotos + photo.secure_url  + ','
      })
    }
   
    return totalPhotos 
  }

  const submitForm = async () => {
    const { token } = await getUserData();
    let customData = {};
    let customBusiness = false;
    if(!formData.googleBusiness)
      customBusiness = true
   
    if(formData.customBusiness){
      customData.rating = formData.customRating
      customData.address = formData.address
      customData.latitude = formData.latitude
      customData.longitude = formData.longitude
      customData.phoneNo = formData.phoneNo
    }
    else{
      customData.rating = null
      customData.address = null
      customData.latitude = null
      customData.longitude = null
      customData.phoneNo = null
    }

    const allPhotos = getPhotos().slice(0,-1);

    if(validate()){
      const body = {
        query:` 
        mutation{
          updateBusiness(businessInput: {
            category: "${formData.category.toString()}",
            name: "${formData.name}",
            id: "${props.id}",
            ageInterval: "${formData.ageInterval}",
            customBusiness: ${customBusiness},
            rating:{
              fun: ${ratingData.fun}
              crowd: ${ ratingData.crowd }
              ratioInput: ${ratingData.ratioInput}
              difficultyGettingIn: ${ratingData.difficultyGettingIn}
              difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
              creationAt: "${moment().format("YYYY-MM-DD HH:mm:ss")}"
            },
            customData:{
              rating: ${customData.rating},
              address: "${customData.address}"
              latitude: ${customData.latitude},
              longitude: ${customData.longitude},
              phoneNo: "${customData.phoneNo}"
            },
            openingHours: "${JSON.stringify(openingHours).replace(/"/g, '\\"') }" 
            photos: "${allPhotos}" 
          })
          {
            name
          }
        }
        `
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } })
        if(res.data.data.updateBusiness){
          setShowPopup(true)
        } 
      }catch(err){
        console.log("the errorsss", err.response)
        setShowPopup(true)
        setSuccess(false);
        
      }
    }
  }

  const getGenderBreakDownValue = (value) => {
    let genderBreakDownValue ;
    if(parseInt(value) === 1)
      genderBreakDownValue = "Equal Girls and Guys";
    else if (parseInt(value) === 2 )
      genderBreakDownValue = "More Guys than Girls";
    else
      genderBreakDownValue = "More Girls than Guys";
    
    return genderBreakDownValue;
  }

  useEffect(() => {
    const fetchData = async() => {
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          getCategories{
            title
            type
            imageUrl
            _id
          }
        }` 
      }
      const singleBusinessBody = {
        query: `
          query{
            getSingleBusiness(id: "${props.id}" ){
            _id
            placeId
            category{
              title
              _id
            }    
            name
            rating{
              fun,
              crowd,
              ratioInput,
              difficultyGettingIn,
              difficultyGettingDrink
            }
            name
            totalUserCountRating
            ageInterval
            customData{
              address
              phoneNo
              rating
              latitude
              longitude
              opening_hours{
                periods{
                  close{
                    day,
                    time
                  },
                  open{
                    day,
                    time
                  },
                  openFullDay
                }
              }
            }
            customBusiness,
            uploadedPhotos{
              secure_url
            }
            googleBusiness{
              formatted_address
              formatted_phone_number
              name
              place_id
              user_ratings_total
              rating
              url
              types
              opening_hours{
                periods{
                  close{
                    day,
                    time
                  },
                  open{
                    day,
                    time
                  },
                  openFullDay
                }
              }
            }
          }}
          `
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
        const getSingleBusinessData = await axios.post(`graphql?`,singleBusinessBody,{ headers: {
          'Authorization': `Bearer ${token}`
        }});
        const singleBusiness = getSingleBusinessData.data.data.getSingleBusiness;
       
        if(singleBusiness.customBusiness){
          setCustomField(true)
          const { customData } = singleBusiness;
          singleBusiness.customRating = customData.rating;
          singleBusiness.latitude = customData.latitude
          singleBusiness.longitude = customData.longitude
          singleBusiness.address =  customData.address
          singleBusiness.phoneNo = customData.phoneNo
          
        }
        const allSpecificCategories = res.data.data.getCategories
        singleBusiness.category.map((category)=>{
          selectedcategoryIds.push(category._id)
          if(category.title === 'Bar')
            setBar(true)  
        })
        let tobeChangeHours = {};
      
        if(singleBusiness && 
          singleBusiness.googleBusiness && 
          singleBusiness.googleBusiness.opening_hours && 
          singleBusiness.googleBusiness.opening_hours.periods.length 
        ){
          tobeChangeHours.periods = singleBusiness.googleBusiness.opening_hours.periods;
          
          let addMissingDays = [];
          const daysPerWeek = [0,1,2,3,4,5,6];
          let allOpenDays = tobeChangeHours.periods.map(period => parseInt(period.open.day))
      
          if(tobeChangeHours.periods && tobeChangeHours.periods.length){  
            tobeChangeHours.periods = daysPerWeek.map( weekNumber => { 
              let again = true;
              
                if( again && allOpenDays.includes(weekNumber)){
                  for (let period of tobeChangeHours.periods){
                    if(parseInt(period.open.day) === parseInt(weekNumber)  ){
                      again = false
                      return period
                    }  
                  } 
                }
                else if(again) {
                  let day = {};
                  let open = {};
                  let close = {};
                  open.day = weekNumber.toString();
                  close.day = weekNumber.toString();
                  open.time = "1100"
                  close.time = "2300"
                  again = false
                  day.openFullDay = true
                  day.open = open;
                  day.close = close; 
                  return day;
                }
              
            })

            console.log("after fetch all Days....", tobeChangeHours)
          }
        }else if(singleBusiness) {
          if(singleBusiness.customData && singleBusiness.customData.opening_hours){
            tobeChangeHours.periods = singleBusiness.customData.opening_hours.periods
          }
          else{
            let increment = false ;
            tobeChangeHours.periods = weekDays.map((dayName, index)=> {      
              return {
                close: {
                  day: index.toString(),
                  time: "2300"
                },
                open: {
                  day: index.toString(),
                  time: "1100"
                },
                openFullDay: true
              }
            })
          }
        }
        console.log("to basda", tobeChangeHours.periods)
        
        setCurrentOpenTime(tobeChangeHours.periods[0].open.time.toString())
        setCurrentCloseTime(tobeChangeHours.periods[0].close.time.toString())
        setCurrentWeekDayName( moment().day())
        setOpeningHours(tobeChangeHours.periods)
        setOpeningHoursFormat( getSpecificTimingPerWeekFormat(tobeChangeHours))
        setRatingData(singleBusiness.rating);
        setSpecificBusinessCategory(singleBusiness.category)
        singleBusiness.category = singleBusiness.category.map(category => category._id)
        singleBusiness.newPhotos = []
        setFormData(singleBusiness)
        setGoogleDetailData(singleBusiness.googleBusiness)
        setCategories(allSpecificCategories);
      }catch(err){
        console.log("the error..... is", err)
      }
    }
    fetchData();
  }, []);

  const getDayNumber = (number) => {
    return parseInt(number)
  }

  const  getSpecificTimingPerWeekFormat = (openingHours)=> {
    let schedulePerWeek = [];
    const daysPerWeek = [0,1,2,3,4,5,6];
    let allOpenDays = openingHours.periods.map(period => parseInt(period.open.day))
    if(openingHours&& openingHours.periods.length){  
      daysPerWeek.map( weekNumber => { 
        let again = true;
        openingHours.periods.map((period, index)=> {
          if( again && allOpenDays.includes(weekNumber)){
            if( parseInt(period.open.day) === weekNumber ){
              let day = {};
              day.openName = weekDays[getDayNumber(period.open.day)]
              day.open = period.open.time
              day.openDayNumber = period.open.day
              day.openFullDay = period.openFullDay;
              day.closeDayNumber = period.close.day
              day.closeName = weekDays[getDayNumber(period.close.day)]
              day.close = period.close.time   
              schedulePerWeek.push(day)
              again = false
            }
          }
          else if(again){
            let day = {};
            day.openName = weekDays[getDayNumber(weekNumber)]
            day.open = "1100"
            day.openDayNumber = weekNumber.toString()
            day.closeDayNumber = weekNumber.toString()
            day.closeName = weekDays[getDayNumber(weekNumber)]
            day.openFullDay = period.openFullDay;
            day.close = "2300" 
            schedulePerWeek.push(day)
            again = false
          }  
        })

      })
    }
    else {
      let dayObject = {};
      daysPerWeek.map( day => {
        dayObject.openName = weekDays[day];
        dayObject.closeName = weekDays[day];
        day.openDayNumber = day
        day.closeDayNumber = day
        dayObject.open =  "11:00"
        day.openFullDay = true
        dayObject.close = "23:00"
        schedulePerWeek.push(dayObject)
      })
    }
    return schedulePerWeek;
  }

  const isSelected = (categoryId) => {
    let formDataCategoryIds = formData.category
    return formDataCategoryIds.includes(categoryId);
  }

  const onChangeTime = (event => {
    let changeOpeningHours = ''
    let displayChanged = {};
    if(event.target.name === "weekDayName"){
      openingHours.map(day => {      
        if(parseInt(day.open.day) === parseInt (event.target.value)){
          setCurrentOpenTime(day.open.time)
          setCurrentCloseTime(day.close.time)
        }
      })
    }
    else if(event.target.name === "weekDayOpenTime"){
      openingHours.map(day => {
        if(parseInt(day.open.day) === parseInt(currentWeekDayName)){
          setCurrentOpenTime(event.target.value)
        }
      })
      

      let completeOpeningTime;
      let completeClosingTime;
      const openingTime = event.target.value.toString();
      const closingTime = currentCloseTime.toString();
      completeOpeningTime = openingTime.split('')
      completeOpeningTime.splice( 2, 0, ":" )
      completeClosingTime = closingTime.split('')
      completeClosingTime.splice( 2, 0, ":" )
      
      const restaurantOpenTime = moment().format("YYYY-MM-DD") + " " + completeOpeningTime.toString().split(',').join("")
      const restaurantCloseTime = moment().format("YYYY-MM-DD") + " " + completeClosingTime.toString().split(',').join("")
     
      if(restaurantCloseTime < restaurantOpenTime){
        changeOpeningHours = openingHours.map(day => {
          if(parseInt(day.open.day) === parseInt(currentWeekDayName) ){
            const whichDay = parseInt(day.open.day) !== 6 ? parseInt(day.open.day) : -1;
            return {
              open: {
                day: day.open.day,
                time: event.target.value
              },
              close: {
                day: (whichDay + 1).toString(),
                time: day.close.time
              },
              openFullDay: day.openFullDay
            }
          }
          else 
            return day
        })
   
      }
      else{
        changeOpeningHours = openingHours.map(day => {
          if(parseInt(day.open.day) === parseInt(currentWeekDayName) ){
            return {
              open: {
                day: day.open.day,
                time: event.target.value
              },
              close: {
                day: day.open.day,
                time: day.close.time
              },
              openFullDay: day.openFullDay
            }
          }
          else 
            return day
        })
      }


      console.log("the change Opening Hours", changeOpeningHours)
      setOpeningHours(changeOpeningHours)
      displayChanged.periods = changeOpeningHours
      setOpeningHoursFormat(getSpecificTimingPerWeekFormat(displayChanged))
    }

    else if(event.target.name === "weekDayCloseTime"){
      openingHours.map(day => {
        if(parseInt(day.open.day) === parseInt(currentWeekDayName) ){
          setCurrentCloseTime(event.target.value)
        }
      })
      let completeOpeningTime;
      let completeClosingTime;
      const openingTime = currentOpenTime.toString();
      const closingTime = event.target.value.toString();
      completeOpeningTime = openingTime.split('')
      completeOpeningTime.splice( 2, 0, ":" )
      completeClosingTime = closingTime.split('')
      completeClosingTime.splice( 2, 0, ":" )
      
      let establishmentOpenTime = moment().format("YYYY-MM-DD") + " " + completeOpeningTime.toString().split(',').join("")
      let establishmentCloseTime  = moment().format("YYYY-MM-DD") + " " + completeClosingTime.toString().split(',').join("")
      
      if( establishmentCloseTime < establishmentOpenTime ){
        changeOpeningHours = openingHours.map(day => {
          if(parseInt(day.open.day) === parseInt(currentWeekDayName) ){
            const whichDay = parseInt(day.open.day) !== 6 ? parseInt(day.open.day) : -1;
            return {
              open: {
                day: day.open.day,
                time: day.open.time
              },
              close: {
                day: (whichDay + 1).toString(),
                time: event.target.value
              },
              openFullDay: day.openFullDay
            }
          }
          else 
            return day
        })
      }
      else{
        changeOpeningHours = openingHours.map(day => {
          if(parseInt(day.open.day) === parseInt(currentWeekDayName) ){
            return {
              open: {
                day: day.open.day,
                time: day.open.time
              },
              close: {
                day: day.open.day,
                time: event.target.value
              },
              openFullDay: day.openFullDay
            }
          }
          else 
            return day
        })
      }
      console.log("changeOpeningHours", changeOpeningHours)
      
      setOpeningHours(changeOpeningHours)
    }
  })

  const isEstablishmentOpen = (timings) => {
    const openingTime = timings.open.toString()
    const closingTime = timings.close.toString()
    let completeOpeningTime;
    let completeClosingTime;
    if(openingTime.length === 3){
      completeOpeningTime = openingTime.split('')
      completeOpeningTime.unshift(0)
      completeOpeningTime.splice( 2, 0, ':' )
      completeClosingTime = closingTime.split('')
      completeClosingTime.unshift(0)
      completeClosingTime.splice( 2, 0, ':' )
    }
    else{
      completeOpeningTime = openingTime.split('')
      completeOpeningTime.splice( 2, 0, ':' )
      completeClosingTime = closingTime.split('')
      completeClosingTime.splice( 2, 0, ':' )
    }

    const restaurantOpenTime = moment().format("YYYY-MM-DD") + " " + completeOpeningTime.toString().split(',').join("")
    const restaurantCloseTime = moment().format("YYYY-MM-DD") + " " + completeClosingTime.toString().split(',').join("")
    const todaysTime = moment().format("YYYY-MM-DD HH:mm");

    if(todaysTime > restaurantOpenTime && todaysTime < restaurantCloseTime ) return true
    return false
    
  }

  const isClosedOnNextDay = (timings) => {
    const openingTime = timings.open.toString()
    const closingTime = timings.close.toString()
    let completeOpeningTime;
    let completeClosingTime;
    completeOpeningTime = openingTime.split('')
    completeOpeningTime.splice( 2, 0, ':' )
    completeClosingTime = closingTime.split('')
    completeClosingTime.splice( 2, 0, ':' )
    const restaurantOpenTime = moment().format("YYYY-MM-DD") + " " + completeOpeningTime.toString().split(',').join("")
    const restaurantCloseTime = moment().format("YYYY-MM-DD") + " " + completeClosingTime.toString().split(',').join("")
    return restaurantCloseTime < restaurantOpenTime ? true : false; 
  }

  let photos = formData.uploadedPhotos && formData.uploadedPhotos.length>0 && formData.uploadedPhotos[0].secure_url ? formData.uploadedPhotos: null
  if(formData.newPhotos && formData.newPhotos.length>0)
    photos = null
  let dataTo = openingHours.toString()

  return(
    <div>
      <CContainer className = "form-container-width" >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Business Updated SuccessFully"} />
        </CRow>
        <CRow>
          <CCol sm = "12" >
            
            { photos ?
                <BusinessCarousel showLink = {false}  business = { formData } category = {specificBusinessCategory} /> 
              : (<CRow>
                  <CCol sm = {12} >
                    <p >Category Image</p>
                    <br />
                    <div style = {{ width: 300, height: 200, border: '1px solid black' }} >
                    <img
                      src = { formData.newPhotos && formData.newPhotos.length>0 &&  formData.newPhotos[0].secure_url }
                      style = {{ width: 300, height: 200, border: '1px solid black' }}
                    />
                    </div>
                    <Widget  
                      showImage = {(url)=>  { 
                        setFormData(prevState => ({ ...prevState, newPhotos: formData.newPhotos.concat(url) }));   
                      }}  
                    />
                    {error.imageUrl &&  <Alert message="You Must Have to Select The Image" type="error" />  }
                    <p>Please select Category Image</p>
                  </CCol>  
                </CRow>)
            } 
          </CCol>
        </CRow>
        <CRow>
          <CCol sm="12">
            <CForm onSubmit={submitForm} >
              <CFormGroup>
                <CLabel htmlFor="nf-email">Title</CLabel>
                <CInput
                  type="text"
                  id="title"
                  name="name"
                  placeholder="Enter title.."
                  value = { formData.name }
                  onChange = { onChange }
                />
                {error.title &&  <Alert message="Please title is required" type="error" />  }
                <CFormText className="help-block">Please enter your Title</CFormText>
              </CFormGroup>
              { customField &&
              <div>
              <CFormGroup>
                <CLabel >Address</CLabel>
                <CInput
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Enter address.."
                  value = { formData.address }
                  onChange = { onChange }
                />
                {error.address &&  <Alert message="Address is required" type="error" />  }
                <CFormText className="help-block">Please enter your Address</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Latittude</CLabel>
                <CInput
                  type="number"
                  id="latitude"
                  name="latitude"
                  placeholder="Enter latitude.."
                  value = { formData.latitude }
                  onChange = { onChange }
                />
                {error.latitude &&  <Alert message="Latitude is required" type="error" />  }
                <CFormText className="help-block">Please enter Correct Latittude</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Longitude</CLabel>
                <CInput
                  type="number"
                  id="longitude"
                  name="longitude"
                  placeholder="Enter longitude.."
                  value = { formData.longitude }
                  onChange = { onChange }
                />
                {error.latitude &&  <Alert message="Longitude is required" type="error" />  }
                <CFormText className="help-block">Please enter Correct Longitude </CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Rating</CLabel>
                <CInput
                  type="number"
                  id="rating"
                  name="rating"
                  placeholder="Enter Google Rating.."
                  value = { formData.customRating }
                  onChange = { onChange }
                  max= {5}
                  min = {1}
                />
                {error.rating &&  <Alert message="Rating is required" type="error" />  }
                <CFormText className="help-block">Please enter Google Rating </CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >PHone No</CLabel>
                <input 
                  type="tel" 
                  name="phoneNo" 
                  id="phone" 
                  pattern="(?:\(\d{3}\)|\d{3})[- ]?\d{3}[- ]?\d{4}" 
                  maxlength="14" title="US based Phone Number in the format of: (123) 456-7890" 
                  placeholder="(xxx) xxx-xxxx" 
                  required
                  onChange = { onChange } 
                  value = {formData.phoneNo}
                  />  
                <CFormText className="help-block">Please Select Phone No</CFormText>
              </CFormGroup>
              </div>
              }  
              <CFormGroup>
                <CLabel >Category</CLabel>
                  <Row>
                    { allCateogories.map((category)=>{
                          if(category.type === "main_category"){
                            return(
                              <Col span={8}>
                                <label>
                                <input 
                                  type="checkbox" 
                                  name = "category" 
                                  value = { category._id } 
                                  defaultChecked={isSelected(category._id)} 
                                  onChange={onChangeCategory} 
                                />
                                 {category.title}
                                </label>
                              </Col>
                            );
                          }  
                        })
                      }
                  </Row>       
                {error.category &&  <Alert message="Select Atleast one category" type="error" />  }
                <CFormText className="help-block">Please Select Category</CFormText>
              </CFormGroup>
              { isBar &&
                (<CFormGroup>
                  <CLabel >Bar Category</CLabel>
                  <Row>
                    { allCateogories.map((category)=>{
                        if(category.type === "sub_bar"){
                          return(
                            <Col span={8}>
                              <label>
                                <input 
                                  type="checkbox" 
                                  name = "barCategory" 
                                  value = { category._id } 
                                  defaultChecked={isSelected(category._id)} 
                                  onChange={onChangeCategory} 
                                />
                                {category.title}
                              </label>
                            </Col>
                          );
                        }  
                        })
                      }
                  </Row> 
                  {error.barcategory &&  <Alert message="category is required" type="error" />  }
                  <CFormText className="help-block">Please Select Bar Category</CFormText>
                </CFormGroup>)
              }
              <CFormGroup>
                <CLabel >AgeInterval</CLabel>
                <select 
                  onChange = {onChange } 
                  name = "ageInterval"
                  value = {formData.ageInterval}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  <option selected value="young">21-25</option>
                  <option value="elder">26-40</option>
                  <option value="all">All</option>
                </select>
                <CFormText className="help-block">Please Select Age</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel style = {{ fontWeight:800 }} >
                  Establishment Hours
                </CLabel>
                { openingHoursFormat && openingHoursFormat.map((timing)=>{
                  // console.log("the timing", timing)
                    return (
                      <div className = "container" >
                        <div
                          className = "row"
                          style = {{ marginTop: 20, width: "100%" }} 
                          onClick = {()=> { 
                            setCurrentWeekDayName(timing.openDayNumber)
                            console.log("its calling...", timing) 
                          }}
                        > 
                          <div 
                            className = "col-md-2" 
                            style = {{ fontSize: 12, textAlign: 'center' }}  
                          >
                            On { timing.openName.charAt(0).toUpperCase() + timing.openName.slice(1) + " " } 
                          </div>
                          <div className = "col-md-3" >
                            <select 
                              onChange = {onChangeTime} 
                              name = "weekDayOpenTime"
                              style = {{ 
                                marginLeft: 20, 
                                marginRight: 20,
                                width: '100%', 
                                padding: 5, 
                                border: '1px solid black', 
                                borderRadius: 10 
                              }} 
                            >
                              { hoursPerDay.map((timeDay, index) => {
                                var openTime = timeDay.substr(0,2)+":"+timeDay.substr(2)
                                return (<option selected= {timing.open === timeDay}  value= { timeDay }> { moment(openTime.toString(), 'HH:mm').format('hh:mm a') }</option>)
                              })  
                              }
                            </select>  
                          </div>
                          <div
                            style = {{textAlign: 'center'  }}
                            className = "col-md-2"
                          >
                            <span>--</span> 
                          </div>
                          <div
                            className = "col-md-3"
                          >
                            <select 
                              onChange = {onChangeTime} 
                              name = "weekDayCloseTime"
                              dayCloseNumber = {timing.closeDayNumber}
                              style = {{ marginLeft: 20, width: '100%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                            >
                              { hoursPerDay.map((timeDay, index) => {
                                  var closeTime = timeDay.substr(0,2)+":"+timeDay.substr(2)
                                  return (<option selected= {timing.close === timeDay} value= { timeDay }> { moment(closeTime.toString(), 'HH:mm').format('hh:mm a') }</option>)
                                })  
                              }
                            </select>
                          </div>
                          <div
                            className = "col-md-2"
                          >
                           <div
                            style = {{
                              cursor: 'pointer',
                              fontSize: 14,
                              fontWeight: '700'
                            }}
                            onClick  = {(e)=> {
                              let changeOpeningHours;
                              changeOpeningHours = openingHours.map(day => {      
                                if(parseInt(day.open.day) === parseInt(timing.openDayNumber) ){
                                  return {
                                    ...day,
                                    openFullDay: !day.openFullDay
                                  }
                                }
                                else 
                                  return day
                              })

                              console.log("the changeOpeningHours....", changeOpeningHours)
                              setOpeningHours(changeOpeningHours)
                              let displayChanged = {};
                              displayChanged.periods = changeOpeningHours;
                              setOpeningHoursFormat(getSpecificTimingPerWeekFormat(displayChanged));
                            }}
                           >
                            { timing.openFullDay ? "Open for Day" : "Close for Day"  }
                           </div>
                          </div>
                          {/* { (isClosedOnNextDay(timing)) && 
                            <div
                              className = "col-md-2"
                            >
                              <p 
                                style = {{
                                  textAlign: "center",
                                  padding: 5,
                                  borderRadius: 20,
                                  color: 'black',
                                  fontSize: 12,
                                  fontWeight: '700'
                                }}
                              >
                                Next Day
                              </p>
                            </div>
                          }        */}
                          {

                          }
                        </div>
                      </div>
                    );
                  })
                }  
                <CFormText className="help-block" style = {{ fontWeight: 600 }} >Please Update Establishment Timings.</CFormText>
              </CFormGroup>
              <p style = {{ fontSize: 20 }} >Rating:</p>
              { ratingData &&
                <CFormGroup>
                  <CLabel style = {{ fontSize: 20 }} > Fun :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating 
                      name="fun"  
                      value = { parseInt(ratingData.fun) } 
                      onChange = { onChangeRating } 
                      size="large" 
                      max = {5}
                    />
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} > { parseInt(ratingData.fun) } </span>
                  <hr />

                  <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating 
                      name="crowd" 
                      value = { parseInt(ratingData.crowd) }  
                      onChange = {onChangeRating } 
                      size="large" 
                      max = {5}
                    />
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} >{ parseInt(ratingData.crowd) }</span>
                  <hr />
                  <CLabel style = {{ fontSize: 20 }} > Gender BreakDown :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating 
                      name="ratioInput" 
                      value={parseInt(ratingData.ratioInput )} 
                      onChange = {onChangeRating} 
                      size="large" 
                      max = {3}
                        
                    />
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} >{ parseInt(ratingData.ratioInput ) }</span>
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
                      value = { parseInt(ratingData.difficultyGettingIn ) }  
                      onChange = {onChangeRating} 
                      size="large" 
                      max = {5}
                    />
                  </span>  
                  <span style = {{ marginLeft: 30, fontSize: 20 }} >{ parseInt(ratingData.difficultyGettingIn ) }</span>
                  <hr />

                  <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                  <span style = {{ position: 'relative', top: 5, left: 20 }} >
                    <Rating 
                      name = "difficultyGettingDrink" 
                      value = { parseInt(ratingData.difficultyGettingDrink ) }  
                      onChange = {onChangeRating} 
                      size="large" 
                      max = {5} 
                    />
                  </span>  
                  <span style = {{ marginLeft: 10, fontSize: 20 }} > {parseInt(ratingData.difficultyGettingDrink )} </span>   
                </CFormGroup>
              }
            </CForm>
          </CCol>
        </CRow>
        <CRow>
          <CCol
            style = {{ textAlign: 'center' }}
          >
          <CButton
            style = {{ marginTop: 100, marginBottom: 50 }}
            color = "info"
            onClick = {()=>{ submitForm()  }}
          >
            Edit Restaurant
          </CButton>
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}