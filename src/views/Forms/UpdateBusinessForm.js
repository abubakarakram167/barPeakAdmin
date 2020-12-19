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
import AxiosApi from 'axios';
import { useState, useEffect } from 'react';
import SimpleReactValidator from 'simple-react-validator';
import { getUserData } from '../../localStorage';
import { Rating } from '@material-ui/lab';
import BusinessCard from '../Business/BusinessCard';
import _, { map } from 'underscore';
import Modal from '../../components/Modal';
import { Alert } from 'antd';
import { Checkbox, Row, Col } from 'antd';
import BusinessCarousel from '../Business/BusinesCarousel';
import Widget from '../../components/Widget';
export default (props) => {
  
  const [allCateogories, setCategories]=useState([]);
  const [isBar, setBar]=useState(false);
  const [formData, setFormData] = useState({});
  const [ratingData, setRatingData] = useState({});
  const [googleDetailData, setGoogleDetailData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const [error, setError] = useState({})
  const [afterTime, setAfterTime] = useState(false);
  
  const selectedcategoryIds = []

  setTimeout(()=> setAfterTime(true), 5000)

  const onChange = (event) => {
    const { name, value } = event.target;
    if(name === "category"){
      const specificCategory = allCateogories.filter(category => category._id === value)[0]
      console.log("the specific category", specificCategory);
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
    
    console.log("the bar category title")
    if( barCategoryTitle.includes("bar") )
      setBar(true)
    else
      setBar(false) 
    
    setFormData(prevState => ({ ...prevState, category: specificCategory }));
  }

  
  const onChangeRating = (event) => {
    const { name, value } = event.target;
    setRatingData(prevState => ({ ...prevState, [name]: value }));
  }

  const validate = () => {
    let errors = {}
    let isValid = true;
    console.log("the title", formData.title)
    if(formData.name === "" || formData.name === undefined){
      console.log("title")
      isValid = false;
      errors["title"] = "Please input title"
    }
    if(formData.category === "" || formData.category === undefined){
      console.log("category")
      isValid = false;
      errors["category"] = "Please input category"
    }
    // if( isBar && formData.barCategory === "" || formData.barCategory === undefined){
    //   console.log("barcate")
    //   isValid = false;
    //   errors["barCategory"] = "Please input bar Category"
    // }
    
    console.log("isValid", isValid)
    if(isValid){
      return true
    }
    setError(errors)
    return false
  }

  const submitForm = async () => {
    const { token } = await getUserData();
    
    if(validate()){
      console.log("inn")
      const body = {
        query:` 
        mutation{
          updateBusiness(businessInput: {
              category: "${formData.category.toString()}",
              name: "${formData.name}",
              placeId: "${props.placeId}",
              ageInterval: "${formData.ageInterval}"
              rating:{
                fun: ${ratingData.fun}
                crowd: ${ ratingData.crowd }
                ratioInput: ${ratingData.ratioInput}
                difficultyGettingIn: ${ratingData.difficultyGettingIn}
                difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
              },
              ratioType: "${formData.ratioType}"
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
        console.log("the response after getting business", res); 
      }catch(err){
        // if(err.response.data){
        //   console.log("the error", err.data.errors.length)
        // }
        setShowPopup(true)
        setSuccess(false);
        console.log("the error below", err.response)
        
      }
    }
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
            getSingleBusiness(placeId: "${props.placeId}" ){
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
            ratioType
            customData{
              address
              phoneNumber
              rating
            }
            uploadedPhotos{
              asset_id
              public_id
              url
              secure_url
              original_filename
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
        console.log("the single business", singleBusiness)
        const allSpecificCategories = res.data.data.getCategories

        singleBusiness.category.map((category)=>{
          selectedcategoryIds.push(category._id)
          if(category.title === 'bar')
            setBar(true)  
        })

        // console.log("the single business detail data", singleBusiness)
        setRatingData(singleBusiness.rating);
        singleBusiness.category = singleBusiness.category.map(category => category._id) 
        setFormData(singleBusiness)
        // setFormData(prevState => ({ ...prevState, title: singleBusiness.name }));
        setGoogleDetailData(singleBusiness.googleBusiness)
        setCategories(allSpecificCategories);
      }catch(err){
        console.log("the error", err.response);
      }
    }
    fetchData();
  }, []);

  const isSelected = (categoryId) => {
    let formDataCategoryIds = formData.category
    return formDataCategoryIds.includes(categoryId);
  }

  const photos = formData.uploadedPhotos && formData.uploadedPhotos.length>0 && formData.uploadedPhotos[0].secure_url ? formData.uploadedPhotos: null 
  console.log("the untern", photos)
  
  return(
    <div>
      <CContainer style = {{ width: "50%" }}  >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Business Updated SuccessFully"} />
        </CRow>
        <CRow>
          <CCol sm = "12" >
            
            { photos ?
                <BusinessCarousel showLink = {false}  business = { formData } /> 
              : (<CRow>
                  <CCol sm = {12} >
                    <p >Category Image</p>
                    <br />
                    <div style = {{ width: 300, height: 200, border: '1px solid black' }} >
                    <img
                      src = { formData.uploadedPhotos &&  formData.uploadedPhotos[0].secure_url }
                      style = {{ width: 300, height: 200, border: '1px solid black' }}
                    />
                    </div>
                    <Widget  
                      showImage = {(url)=>  { 
                        console.log("the url incomng", url)
                        setFormData(prevState => ({ ...prevState, uploadedPhotos: [url] }));   
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
              <CFormGroup>
                <CLabel >Category</CLabel>
                  <Row>
                    { allCateogories.map((category)=>{
                          if(category.type === "main_category"){
                            return(
                              <Col span={8}>
                                <label>
                                <input type="checkbox" name = "category" value = { category._id } defaultChecked={isSelected(category._id)} onChange={onChangeCategory} />
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
                  <select 
                    onChange = { onChange } 
                    name = "barCategory"
                    value = { !_.isEmpty(formData) && formData.barCategory &&formData.barCategory._id }
                    style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                  >
                    { allCateogories.map((category)=>{
                        if(category.type === "sub_bar"){
                          return(
                            <option value = {category._id}>{ category.title }</option>
                          );
                        }  
                      })
                    }
                  </select>
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
              <p style = {{ fontSize: 20 }} >Rating:</p>
              <CFormGroup>
                <CLabel style = {{ fontSize: 20 }} > Fun :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="fun"  value = { ratingData.fun ? ratingData.fun : 5  } onChange = { onChangeRating } size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} > { ratingData.fun } </span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="crowd" value = { ratingData.crowd ? ratingData.crowd : 5  }  onChange = {onChangeRating } size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.crowd }</span>
                <hr />

                <select 
                  onChange = {onChange } 
                  name = "ratioType"
                  value = { formData.ratioType }
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  <option selected value="girl">girlToGuyRatio</option>
                  <option value="boy">boyToGirlRatio</option>
                </select>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="ratioInput" value={ratingData.ratioInput} onChange = {onChangeRating} size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.ratioInput }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingIn :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingIn" value = { ratingData.difficultyGettingIn ? ratingData.difficultyGettingIn : 5  }  onChange = {onChangeRating} size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.difficultyGettingIn }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingDrink" value = { ratingData.difficultyGettingDrink ? ratingData.difficultyGettingDrink : 5  }  onChange = {onChangeRating} size="large" precision = {0.1} max = {5} />
                </span>  
                <span style = {{ marginLeft: 10, fontSize: 20 }} > { ratingData.difficultyGettingDrink } </span>   
              </CFormGroup>
            </CForm>
          </CCol>
        </CRow>
        <CRow>
          <CCol>
          <CButton
            style = {{ marginTop: 100, marginBottom: 50 }}
            color = "info"
            onClick = {()=>{ submitForm()  }}
          >
            Edit Restaurant
          </CButton>
          {/* <input type = "submit" />    */}
          </CCol>
        </CRow>
      </CContainer>    
    </div>
  );
}