import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Pagination from '@material-ui/lab/Pagination';
import { useState, useEffect } from 'react';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function BasicPagination(props) {
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const classes = useStyles();
  const updatePage = (pageNumber) => {
    setCurrentPageNo(pageNumber)
    props.onChange(pageNumber)
  }

  return (
    <div className={classes.root}> 
      <Pagination page = {currentPageNo} count={10} color="primary" onChange = {(currentPage, pageNumber) => { updatePage(pageNumber) }} />
    </div>
  );
}