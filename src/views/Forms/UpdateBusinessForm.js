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
  "1000",
  "1100",
  "1200",
  "1300",
  "1400",
  "1500",
  "1600",
  "1700",
  "1800",
  "1900",
  "2000",
  "2100",
  "2200",
  "2300",
  "0000",
  "0100",
  "0200",
  "0300",
  "0400",
  "0500",
  "0600",
  "0700",
  "0800",
  "0900",
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
              ageInterval: "${formData.ageInterval}"
              rating:{
                fun: ${ratingData.fun}
                crowd: ${ ratingData.crowd }
                ratioInput: ${ratingData.ratioInput}
                difficultyGettingIn: ${ratingData.difficultyGettingIn}
                difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
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
        console.log("the error", err.response)
        setShowPopup(true)
        setSuccess(false);
        
      }
    }
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
                  }
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
        let openingHours = [];
        if(singleBusiness && 
          singleBusiness.googleBusiness && 
          singleBusiness.googleBusiness.opening_hours && 
          singleBusiness.googleBusiness.opening_hours.periods.length 
        ){
          openingHours = singleBusiness.googleBusiness.opening_hours.periods;
        }else if(singleBusiness) {
          let increment = false ;
          openingHours = weekDays.map((dayName, index)=> {
            if(index === 6){
              index = -1
              increment = true
            }
            else {
              increment = false
            }
              
            return {
              close: {
                day: (index + 1) .toString(),
                time: "0200"
              },
              open: {
                day:  increment ? "6" : index.toString(),
                time: "1100"
              }
            }
          })
        }
        // console.log("the open time", openingHours[0].open.time)
        setCurrentOpenTime(openingHours[0].open.time.toString())
        setCurrentCloseTime(openingHours[0].close.time.toString())
        setCurrentWeekDayName( parseInt(openingHours[0].open.day))
        setOpeningHours(openingHours)
        setRatingData(singleBusiness.rating);
        setSpecificBusinessCategory(singleBusiness.category)
        singleBusiness.category = singleBusiness.category.map(category => category._id)
        singleBusiness.newPhotos = []
        setFormData(singleBusiness)
        setGoogleDetailData(singleBusiness.googleBusiness)
        setCategories(allSpecificCategories);
      }catch(err){
        console.log("the error..... is", err.response.data)
      }
    }
    fetchData();
  }, []);

  const isSelected = (categoryId) => {
    let formDataCategoryIds = formData.category
    return formDataCategoryIds.includes(categoryId);
  }

  const onChangeTime = (event => {
    let changeOpeningHours = ''
    if(event.target.name === "weekDayName"){
      setCurrentWeekDayName(parseInt(event.target.value))
      openingHours.map(day => {      
        if(parseInt(day.open.day) === parseInt (event.target.value)){
          setCurrentOpenTime(day.open.time)
          setCurrentCloseTime(day.close.time)
        }
      })
    }
    else if(event.target.name === "weekDayOpenTime"){
      openingHours.map(day => {
        if(parseInt(day.open.day) === currentWeekDayName){
          setCurrentOpenTime(event.target.value)
        }
      })
      changeOpeningHours = openingHours.map(day => {
        if(parseInt(day.open.day) === currentWeekDayName){
          return {
            open: {
              day: currentWeekDayName.toString(),
              time: event.target.value
            },
            close: {
              day: day.close.day,
              time: day.close.time
            }
          }
        }
        else 
          return day
      })
      setOpeningHours(changeOpeningHours)
    }

    else if(event.target.name === "weekDayCloseTime"){
      openingHours.map(day => {
        if(parseInt(day.open.day) === currentWeekDayName){
          setCurrentCloseTime(event.target.value)
        }
      })
      changeOpeningHours = openingHours.map(day => {
        if(parseInt(day.open.day) === currentWeekDayName){
          return {
            open: {
              day: day.open.day,
              time: day.open.time
            },
            close: {
              day: day.close.day,
              time: event.target.value
            }
          }
        }
        else 
          return day
      })
      setOpeningHours(changeOpeningHours)
    }
  })

  let photos = formData.uploadedPhotos && formData.uploadedPhotos.length>0 && formData.uploadedPhotos[0].secure_url ? formData.uploadedPhotos: null
  if(formData.newPhotos && formData.newPhotos.length>0)
    photos = null
  let dataTo = openingHours.toString()
  // console.log("the opening Hours......", JSON.stringify(openingHours))
  // console.log("after object split", dataTo.split(''))
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
                <CLabel >Establishment Hours</CLabel>
                <select 
                  onChange = {onChangeTime } 
                  name = "weekDayName"
                  value = {currentWeekDayName}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  { 
                    openingHours.length && openingHours.map((weekDay, index) => {
                      const { open } = weekDay;
                      return (<option selected value= { parseInt(open.day) }> { weekDays[parseInt(open.day)]  }</option>)
                    })  
                  }       
                </select>
                <CFormText className="help-block">Please Select Age</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Open</CLabel>
                <select 
                  onChange = {onChangeTime} 
                  name = "weekDayOpenTime"
                  value = {currentOpenTime}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  { hoursPerDay.map((timeDay, index) => {
                    return (<option selected value= { timeDay }> { timeDay  }</option>)
                  })  
                  }
                </select>
                <CFormText className="help-block">Please Select Opening Time</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Close</CLabel>
                <select 
                  onChange = {onChangeTime} 
                  name = "weekDayCloseTime"
                  value = {currentCloseTime}
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  { hoursPerDay.map((timeDay, index) => {
                    return (<option selected value= { timeDay }> { timeDay  }</option>)
                  })  
                  }
                </select>
                <CFormText className="help-block">Please Select Closing Time</CFormText>
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