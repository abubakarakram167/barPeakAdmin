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
import { ToastContainer } from 'react-toastify';
import { MDBNotification } from "mdbreact";
import { message, Button } from 'antd';
import Modal from '../../components/Modal';
import { Alert } from 'antd';
export default (props) => {
  
  const [allCateogories, setCategories]=useState([]);
  const [isBar, setBar]=useState(false);
  const [formData, setFormData] = useState({});
  const [ratingData, setRatingData] = useState({});
  const [googleDetailData, setGoogleDetailData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true); 
  const [error, setError] = useState({})


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

  
  const onChangeRating = (event) => {
    const { name, value } = event.target;
    setRatingData(prevState => ({ ...prevState, [name]: value }));
  }

  const validate = () => {
    let errors = {}
    let isValid = true;
    console.log("the title", formData.title)
    if(formData.title === "" || formData.title === undefined){
      console.log("title")
      isValid = false;
      errors["title"] = "Please input title"
    }
    if(formData.shortDescription === "" || formData.shortDescription === undefined){
      console.log("short")
      isValid = false;
      errors["shortDescription"] = "Please input short Description"
    }
    if(formData.longDescription === "" || formData.longDescription === undefined){
      console.log("long")
      isValid = false;
      errors["longDescription"] = "Please input long Description"
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
    const category = isBar ? formData.barCategory._id : formData.category._id;
    
    // console.log("at submission", formData);
    // console.log("at submission", ratingData)
    // console.log("the category", category)

    if(validate()){
      console.log("inn")
      const body = {
        query:` 
        mutation{
          updateBusiness(businessInput: {
              category: "${category}",
              title: "${formData.title}",
              placeId: "${props.placeId}",
              ageInterval: "${formData.ageInterval}"
              rating:{
                fun: ${ratingData.fun}
                crowd: ${ ratingData.crowd }
                girlToGuyRatio: ${ratingData.girlToGuyRatio}
                difficultyGettingIn: ${ratingData.difficultyGettingIn}
                difficultyGettingDrink : ${ratingData.difficultyGettingDrink}
              }
              longDescription: "${formData.longDescription}",
              shortDescription: "${ formData.shortDescription}"
      
          })
          {
            title
          }
        }`
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
          getSingleBusiness(placeId: "${props.placeId}"){
                 placeId,
                 category{
                     title
                     type
                     imageUrl
                     _id
                 },
                 shortDescription,
                 longDescription,
                 title,
                 ageInterval,
                 rating{
                     fun,
                     crowd,
                     girlToGuyRatio,
                     difficultyGettingIn,
                     difficultyGettingDrink
                 }
             }
        }`
      }
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
        const getSingleGoogleData = await axios.get(`http://localhost:3000/getSinglePlaceResult?place_id=${props.placeId}`);
        const getSingleBusinessData = await axios.post(`graphql?`,singleBusinessBody,{ headers: {
          'Authorization': `Bearer ${token}`
        }});
        const singleBusiness = getSingleBusinessData.data.data.getSingleBusiness;
        const allSpecificCategories = res.data.data.getCategories
        if(singleBusiness.category.type === "sub_bar"){
          setBar(true)
          singleBusiness.barCategory = singleBusiness.category
          singleBusiness.category = allSpecificCategories.filter(category => category.title === 'bar')[0]
        }
        console.log("the single business detail data", singleBusiness)
        setRatingData(singleBusiness.rating);
        setFormData(singleBusiness)
        setGoogleDetailData(getSingleGoogleData.data)
        setCategories(allSpecificCategories);
      }catch(err){
        console.log("the error", err);
      }
    }
    fetchData();
  }, []);

    //  console.log("the google detail data", googleDetailData)
   console.log("form Data", formData)
   console.log("the rating Data", ratingData);

  return(
    <div>
      <CContainer style = {{ width: "50%" }}  >
        <CRow>
          <Modal showPopup = {showPopup} success = {success} history = {props.history} message = {"Business Updated SuccessFully"} />
        </CRow>
        <CRow>
          {/* <MDBNotification
            show = {showAlert}
            fade
            autohide = {10000}
            icon="envelope"
            iconClassName="green-text"
            title="Success"
            message="Business Sccessfull Updated"
            text="1min ago"
          /> */}
        </CRow>
        <CRow>
          <CCol sm = "12" >
            { !_.isEmpty(googleDetailData) &&
              <BusinessCard showLink = {false}  business = {googleDetailData} /> 
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
                  name="title"
                  placeholder="Enter title.."
                  defaultValue = {googleDetailData["name"]}
                  value = { formData.title }
                  onChange = { onChange }
                />
                {error.title &&  <Alert message="Please title is required" type="error" />  }
                <CFormText className="help-block">Please enter your Title</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Short Description</CLabel>
                <CTextarea
                  name="shortDescription"
                  placeholder="Enter Short Description."
                  onChange = { onChange }
                  value = { formData.shortDescription }
                  rows = "2"
                />
                 {error.shortDescription &&  <Alert message="SHort Description is required" type="error" />  }
                <CFormText className="help-block">Please enter Short Description</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Long Description</CLabel>
                <CTextarea
                  name="longDescription"
                  placeholder="Enter Long Description."
                  onChange = { onChange }
                  value = {formData.longDescription}
                  size = "large"
                  rows = "5"
                  cols = "40"
                />
                 {error.longDescription &&  <Alert message="Long Description is required" type="error" />  }
                <CFormText className="help-block">Please enter Long Description</CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel >Category</CLabel>
                <select 
                  onChange = {onChange}
                  name = "category"
                  value = {!_.isEmpty(formData) &&formData.category._id} 
                  style = {{ marginLeft: 20, width: '30%', padding: 5, border: '1px solid black', borderRadius: 10 }} 
                >
                  { allCateogories.map((category)=>{
                      if(category.type === "main_category"){
                        return(
                          <option value = {category._id}>{ category.title }</option>
                        );
                      }  
                    })
                  }
                </select>
                {error.category &&  <Alert message="category is required" type="error" />  }
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
                  <Rating name="fun"  value = { ratingData.fun ? ratingData.fun : 5  } onChange = { onChangeRating } size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} > { ratingData.fun } </span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > Crowd :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="crowd" value = { ratingData.crowd ? ratingData.crowd : 5  }  onChange = {onChangeRating } size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.crowd }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > girlToGuyRatio :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name="girlToGuyRatio" value = { ratingData.girlToGuyRatio ? ratingData.girlToGuyRatio : 5  }  onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.girlToGuyRatio }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingIn :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingIn" value = { ratingData.difficultyGettingIn ? ratingData.difficultyGettingIn : 5  }  onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
                </span>  
                <span style = {{ marginLeft: 30, fontSize: 20 }} >{ ratingData.difficultyGettingIn }</span>
                <hr />

                <CLabel style = {{ fontSize: 20 }} > difficultyGettingDrink :</CLabel>
                <span style = {{ position: 'relative', top: 5, left: 20 }} >
                  <Rating name = "difficultyGettingDrink" value = { ratingData.difficultyGettingDrink ? ratingData.difficultyGettingDrink : 5  }  onChange = {onChangeRating} size="large" precision = {0.1} max = {10} />
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