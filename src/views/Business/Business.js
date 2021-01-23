import {
  CTabs,
  CNav,
  CNavItem,
  CNavLink,
  CTabPane,
  CTabContent,
  CRow,
  CCol
} from '@coreui/react'
import Businesslist from './BusinessList';
import { useState, useEffect } from 'react';
import axios from '../../api';
import { getUserData } from '../../localStorage';
import { Radio } from 'antd';
import './business.css'
import Loader from 'react-loader-spinner'
import SearchField from "react-search-field";
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom'
import {Row, Col} from 'antd';
export default (props) => {  
  const [showNotAddedLoader, setShowNotAddedLoader] = useState(false);
  const [showAddedLoader, setShowAddedLoader] = useState(false);
  const [showCategorizeLoader, setShowCategorizeLoader] = useState(false);
  const [addedBusiness, setAddedBusinesses]=useState([]);
  const [notAddedBusiness, setNotAddedBusiness] = useState([]);
  const [notCategorize, setNotCategorize] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setCategory] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [success, setSuccess] = useState(true)
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  //For Testing
 
  const onChange = e => {
    setCategory(e.target.value);
    const specificCategory = categories.filter( category => category._id === e.target.value )[0]._id;
    requestAddedBusiness(1, specificCategory)
  };

  const getAllBusinessCategories = (categories, isBar) =>{
    if(isBar){
      return categories.map((category)=>{
        return category.type;
      })
    }
    else{
      return categories.map((category)=>{
        return category.title;
      })
    }
    
  }
 
  const getAllBusiness = async(pageNumber, added, filter) => {
    
    try{ 
      const { token } = await getUserData();
      const body = {
        query:`
          query{
            getAllBusiness(filterInput: { pageNo: ${pageNumber}, filter: "${filter}", added: ${added} }){
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
            }
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
            }
            }}
          `
      }
      
      const getAllBusiness = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });
      
      return getAllBusiness.data.data.getAllBusiness;

    }catch(err){
      console.log("the error", err.response)
    }  
  }

  useEffect(() => {
    const fetchData = async()=>{
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
      
      try{
        const res = await axios.post(`graphql?`,body,{ headers: {
          'Authorization': `Bearer ${token}`
        } });
        
        
        setCategories(res.data.data.getCategories)
        const allCategories = res.data.data.getCategories.filter(category => category.type === "main_category")[0]
       
        setCategory(allCategories._id)  
        

       requestNotAddedBusiness(1);
       requestAddedBusiness(1, allCategories._id);
       requestNotCategorize(1)
       
      }catch(err){
        console.log("the roor", err.response)
      }  
    }
    fetchData();
  }, []);

  const makeSearch = async(added, filter) =>{
    try{ 
      const { token } = await getUserData();
      const body = {
        query:`
        query{
          getSearchResults(searchInput: { searchValue: "${searchValue}", filter: "${filter}", added: ${added} }){
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
           }
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
           }
          }}
          `
      }
      
      const getAllBusiness = await axios.post(`graphql?`,body,{ headers: {
        'Authorization': `Bearer ${token}`
      } });
      
      return getAllBusiness.data.data.getSearchResults;

    }catch(err){
      console.log("the error", err.response)
    }  
  }

  const getSearchResults = async(tab) =>{
  
    if(tab === 'notAdded'){
      setShowNotAddedLoader(true)
      const searchResults = await makeSearch(false, 'not')
      setNotAddedBusiness(searchResults)
      setShowNotAddedLoader(false)
    }
    else if(tab === 'added'){
      setShowAddedLoader(true)
      const searchResults = await makeSearch(true, 'allCategorySearch')
      setAddedBusinesses(searchResults)
      setShowAddedLoader(false)
    }
    else if(tab === 'notCategorize'){
      setShowCategorizeLoader(true)
      const searchResults = await makeSearch(true, 'not')
      setNotCategorize(searchResults)
      setShowCategorizeLoader(false)
    }



  }

  const requestNotAddedBusiness = async(pageNumber) => {
    setShowNotAddedLoader(true)
    try{
    const notAddedBusiness = await getAllBusiness(pageNumber, false, 'not');
    setShowNotAddedLoader(false)
    setNotAddedBusiness(notAddedBusiness)
    }catch(err){
      console.log("the error", err.response)
    }
   
  }

  const requestAddedBusiness = async(pageNumber, selectedCategory) => {
    setShowAddedLoader(true)
    const addedBusiness = await getAllBusiness(pageNumber, true, selectedCategory);
    setShowAddedLoader(false)
    setAddedBusinesses(addedBusiness)
  }

  const requestNotCategorize = async(pageNumber) => {
    setShowCategorizeLoader(true)
    const addedBusiness = await getAllBusiness(pageNumber, true, 'not');
    setNotCategorize(addedBusiness)
    setShowCategorizeLoader(false)
  }
  
  const changeSearchValue = async(e, currentCase) => {
    if(e === ''){
      if(currentCase === 'notAdded')
        requestNotAddedBusiness(1);
      else if(currentCase === 'added'){ 
        requestAddedBusiness(1, selectedCategory);
      }
      else if(currentCase === 'notCategorize')
        requestNotCategorize(1)
    }
    setSearchValue(e)
  }

  const addCategorizeBusiness = async (placeId) => {
    const body = {
      query:`
        mutation{
          addNotCategorizeBusiness(placeId: "${placeId}")
        }
      `
    }
    try{
      const businessAdd = await axios.post(`graphql?`,body);
      const isAdd =  businessAdd.data.data.addNotCategorizeBusiness
      if(isAdd)
        setSuccess(true)
      else
        setSuccess(false)
      setShowPopup(true)
    }catch(error){

    }
   
  }

  return (
    <div>
      <CTabs activeTab="addBusiness">
        <CNav variant="tabs">
          <CNavItem>
            <CNavLink data-tab="addBusiness">
              ADD Business
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="recentlyAdded">
              Recently ADDED
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink data-tab="notCategorize">
              Not Categorize
            </CNavLink>
          </CNavItem>
        </CNav>
        <CTabContent>
          <CTabPane data-tab="addBusiness">
          <CRow>
            <Modal 
              closeModal = {()=> {
                requestNotAddedBusiness(currentPageNumber)
                setShowPopup(false) 
              }} 
              notRedirect = {true} 
              showPopup = {showPopup} 
              success = {success} 
              history = {props.history} 
              message = {"Business Added SuccessFully"} 
            />
          </CRow> 
          <CRow className = "search-bar" >
            <CCol 
              xs = {12} 
              sm = {7} 
              className = "searchedgrid" 
            >
              <SearchField
                placeholder="Search "
                onChange={ (e)=> { changeSearchValue(e, 'notAdded')} }
                className="search-bar-input"
                onSearchClick = { ()=> {  getSearchResults('notAdded') } }
              />
            </CCol>
            <CCol 
              xs = {12}
              sm = {5}
              className = "searchedgrid" 
            >
              <Link  
                style = {{ backgroundColor: "#549bd4", color: "white", padding: 8, paddingTop: 12, paddingBottom: 12 }} 
                to={`/addBusiness`} 
              >
                ADD Business
              </Link>
            </CCol>
          </CRow>
            { showNotAddedLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            <div>        
              <Businesslist  
                businesses = {notAddedBusiness}
                addCategorizeBusiness = {(placeId)=> addCategorizeBusiness(placeId)} 
                update = {false} 
              />
            </div>
            }
            <div className = "pagination-style" >
              < Pagination onChange = { (pageNumber)=>{
                setCurrentPageNumber(pageNumber) 
                requestNotAddedBusiness(pageNumber)
              } } />
            </div>    
          </CTabPane>
          <CTabPane data-tab="recentlyAdded">
          <CRow className = "search-bar" >
            <CCol xs = {12}  className = "searchedgrid" style = {{ textAlign: 'center' }} >
              <SearchField
                placeholder="Search "
                onChange={ (e)=> { changeSearchValue(e, 'added')} }
                classNames="test-class"
                onSearchClick = { ()=> {  getSearchResults('added') } }
              />
            </CCol>
          </CRow>
          { showAddedLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            <div>
              <CRow className = "search-bar" >
                <CCol className = "business-type-container" sm = {12} >
                  <div className = "business-type-text" >What you want to ADD ?</div>  
                  <Radio.Group onChange={onChange} value={selectedCategory}>
                    { categories.map((category)=>{
                        if(category.type === "main_category"){
                          return(
                            <Radio value={category._id}>{ category.title }</Radio>
                          )
                        }
                      }) 
                    }
                  </Radio.Group>
                </CCol>
              </CRow>
              <Businesslist  
                businesses = {addedBusiness} 
                update = {true}
                category = {selectedCategory} 
              />
            </div>
            }
            <div className = "pagination-style" >
              < Pagination onChange = { (pageNumber)=>{ 
                requestAddedBusiness(pageNumber, selectedCategory)
              } } />
            </div>    
          </CTabPane>
          <CTabPane data-tab="notCategorize">
          <CRow>
            <CCol xs = {12}
              className = "searchedgrid" 
              style = {{ textAlign: 'center' }}
            >
              <SearchField
                placeholder="Search "
                onChange={ (e)=> { changeSearchValue(e, 'notCategorize')} }
                classNames="test-class"
                onSearchClick = { ()=> {  getSearchResults('notCategorize') } }
              />
            </CCol>
          </CRow>
          { showCategorizeLoader ?
            ( <Loader
              type="Oval"
              color="gray"
              height={60}
              width={60}
              style = {{textAlign: 'center'}}
            /> ) :
            <div>  
              <div> 
                <Businesslist history = {props.history} businesses = {notCategorize} update = {true} />
              </div>
            </div>  
          }
          <div className = "pagination-style" >
            < Pagination onChange = { (pageNumber)=>{ 
              requestNotCategorize(pageNumber)
            } } />
          </div>
          </CTabPane>
        </CTabContent>
      </CTabs>
    </div>
  );
}