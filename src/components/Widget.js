import React from 'react';

class CloudinaryWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showWidget: false,
      url: null
    }
  }

  showWidget = () => {
    this.setState({ showWidget: true })
  }

  checkUploadResult = (resultEvent) => {
    if(resultEvent.event === 'success'){
      console.log("the url", resultEvent.info.url)
      this.setState({ url: resultEvent.info.url })
      this.props.showImage(resultEvent.info.url)
      // this.setState({ imageShow: true })
    }
  }

  render() {
    if(this.state.showWidget){
      let widget = window.cloudinary.openUploadWidget({
        cloudName: "developer-inn",
        uploadPreset: "obid55oq"},
        (error, result) => {this.checkUploadResult(result)
      });
    }
 

    return (
      <div>
        <div id = "photo-form-container" style = {{ textAlign:'center', marginTop: 30 }}>
          <button style = {{ position: 'absolute', top: '30%', left: '24%' }} className = "widget-button"  onClick = { () => this.showWidget() }  > { !this.state.url ?' Upload' : 'Change'  } </button>
        </div>
      </div> 
    );
  }
}

export default CloudinaryWidget;