import React, { Component } from 'react'
import { Grid, Segment, Statistic, Card, Message, Dropdown, Button, Image, Input } from 'semantic-ui-react'
import Product from './Product';
import { getShops, getPrice, getProduct } from "./../../helpers/db";
import { urlToGetImage, updateCartArray, getCartArray } from "./../../config/constants";


export default class Cart extends Component {


  /**
  Car shows up only if there items added
  */

  constructor(props){
    super(props);
    this.state = {
      shops : [],
      prices : undefined,
      productsList : {},
      cartArray : []
    }
  }
  
  getproductData = () => {
    getProduct().on('value' , (productSnapshot) => {
      let productsList = productSnapshot.val();
      this.setState({ productsList });
    });
  }

  getImageUrl = (key, selectedItem) => {
    return urlToGetImage + selectedItem + "_200/" + key + ".png";
  }

  getShopData = () => {
    getShops().then((data) => {
      let shops = data.val();
      shops = shops.map((item, index) => {
        return {
          key : index,
          value : {
            ...item
          },
          text : item.name
        };
      });
      this.setState({ shops });
    });
  }

  componentDidMount(){
    //updateCartArray([]);
    this.getproductData();
    this.getShopData();
    this.setState({
      cartArray : getCartArray()
    })
    console.log(this.state);
  }

  changePriceForm = (prices) => {
      let ravvaPrice = prices.ravva || {};
      let ricePrice = prices.rice || {};
      let brokenPrice = prices.brokenPrice || {};

      let productsList = this.state.productsList;
      let ravvaProduct = productsList.ravva || {};
      let riceProduct = productsList.rice || {};
      let brokenProduct = productsList.broken || {};

      let { cartArray, selectedShop } = this.state;

      Object.entries(ravvaPrice).map((item) => {
        let isAddedToCart = cartArray && (cartArray.length > 0) && cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        });
        isAddedToCart = !!isAddedToCart;
        item[1]['master_weight'] = ravvaProduct[item[0]].master_weight;
        item[1]["name"] = ravvaProduct[item[0]].name;
        item[1]["addedToCart"] = isAddedToCart;
        item[1]["quintals"] = isAddedToCart ? cartArray && (cartArray.length > 0) && cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.quintals : 0;
        item[1]["bags"] = isAddedToCart ? cartArray && (cartArray.length > 0) && cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.bags : 0;
        item[1]["totalPrice"] = isAddedToCart ? cartArray && (cartArray.length > 0) && cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.totalPrice : 0;
      });

      Object.entries(ricePrice).map((item) => {
        let isAddedToCart = cartArray && (cartArray.length > 0) && cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        });
        isAddedToCart = !!isAddedToCart;
        item[1]['master_weight'] = riceProduct[item[0]].master_weight;
        item[1]["name"] = riceProduct[item[0]].name;
        item[1]["addedToCart"] = isAddedToCart;
        item[1]["quintals"] = isAddedToCart ? cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.quintals : 0;
        item[1]["bags"] = isAddedToCart ? cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.bags : 0;
        item[1]["totalPrice"] = isAddedToCart ? cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.totalPrice : 0;
      });

      Object.entries(brokenPrice).map((item) => {
        let isAddedToCart = cartArray && (cartArray.length > 0) && cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        });
        isAddedToCart = !!isAddedToCart;
        item[1]['master_weight'] = brokenProduct[item[0]].master_weight;
        item[1]["name"] = brokenProduct[item[0]].name;
        item[1]["addedToCart"] = isAddedToCart;

        item[1]["quintals"] = isAddedToCart ? cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.quintals : 0;
        item[1]["totalPrice"] = isAddedToCart ? cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.totalPrice : 0;
        item[1]["bags"] = isAddedToCart ? cartArray.find((item1) => {
          if(item1.shopId === (selectedShop.tin || selectedShop.gst)){
            if(item1.key === item[0]) return true;
          }
          return false;
        }).value.bags : 0;
      });


      this.setState({ prices });
      console.log(prices, "Prices");
  }

  handleChange = (e, { value }) => {
    this.setState({
      priceArray : null, selectedTab : ""
    });
    this.setState({ selectedShop : value });
    console.log(value.areaId);
    getPrice(value.areaId).then((data) => {
      let prices = data.val();
      if(!prices){
        alert("Prices is null for this");
        this.setState({ selectedShop : null });
        return;
      }
      this.changePriceForm(prices);
    });
    console.log(this.state);
  }

  changeTab = (type) => {
    let prices = this.state.prices;
    if(!prices){
      alert("There is no prices for this");
      return;
    }
    let priceArray = prices[type];
    if(priceArray){
      priceArray = Object.entries(priceArray);
    }else{
      priceArray = [];
    }
    this.setState({ priceArray, selectedTab : type });
  }

  updateUI = (obj) => {
    let priceArray = this.state.priceArray;
    let { value, index, item } = obj;
    let master_weight = item.master_weight.replace("KG", "");
    if(obj.type == "bags"){
      let quintals = (master_weight * value) / 100;
      priceArray[index][1]["quintals"] = quintals;
      priceArray[index][1]["bags"] = value;
      priceArray[index][1]["totalPrice"] = quintals * item.Agent;
    }else if(obj.type == "quintals"){
      let bags = (value * 100) / master_weight;
      priceArray[index][1]["quintals"] = value;
      priceArray[index][1]["bags"] = bags;
      priceArray[index][1]["totalPrice"] = value * item.Agent;
    }
    this.setState({ priceArray });
  }

  toggleInCart = (obj) => {
    let { index } = obj; 
    let { priceArray, cartArray, selectedShop } = this.state;
    if(!priceArray[index][1]["addedToCart"]){
        let cartObj = {
          key : priceArray[index][0],
          value : priceArray[index][1],
          shopId : selectedShop.gst || selectedShop.tin,
          shopName : selectedShop.name,
          type : this .state.selectedTab,
          ...selectedShop
        };
        cartArray.push(cartObj);
    }else{
      let key = priceArray[index][0];
      for(let index = 0; index < cartArray.length; index++){
        let shopId = selectedShop.gst || selectedShop.tin;
        if(cartArray[index]["key"] == key && cartArray[index]["shopId"] === shopId){
          cartArray.splice(index, 1);
          break;
        }
      }
    }
    this.setState({ cartArray });
    updateCartArray(cartArray);
    priceArray[index][1]["addedToCart"] = !priceArray[index][1]["addedToCart"];
    this.setState({ priceArray });
  }

  render() {
    return (
      <div className="buy head">
        <h1>Products</h1>
        {/* <Message visible className="blink">This page is under construction. DO NOT USE</Message> */}
        {
          this.state.shops && this.state.shops.length > 0 && <h2>Select Shop</h2>
        }
        {
          this.state.shops && this.state.shops.length > 0 && (
            <Dropdown
              placeholder='Select Shop'
              fluid
              selection
              onChange={this.handleChange}
              options={this.state.shops}
              style={{
                marginBottom : 20
              }}
            />
          )
        }
        {
          // this.state.prices && ()
        }
        {/* <Grid>
          <Grid.Row className="products">
            <Grid.Column>
              <Segment className='productsContainer'>
                <Product />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid> */}
        {
          this.state.selectedShop && (
        <Grid columns={3} divided style={{
          marginLeft : 20
        }}>
          <Grid.Row>
            <Grid.Column>
              <Button style={{
                width : '100%',
                fontSize: 14,
                backgroundColor : this.state.selectedTab === "rice" ? "#16a085" : undefined,
                color : this.state.selectedTab === "rice" ? "white" : undefined
              }}
              onClick={() => this.changeTab('rice')}
              > Rice </Button>
            </Grid.Column>
            <Grid.Column >
              <Button style={{
                width : '100%',
                fontSize: 14,
                backgroundColor : this.state.selectedTab === "ravva" ? "#16a085" : undefined,
                color : this.state.selectedTab === "ravva" ? "white" : undefined
              }}
              onClick={() => this.changeTab('ravva')}
              > Ravva </Button>
            </Grid.Column>
            <Grid.Column>
              <Button style={{
                width : '100%',
                fontSize: 14,
                backgroundColor : this.state.selectedTab === "broken" ? "#16a085" : undefined,
                color : this.state.selectedTab === "broken" ? "white" : undefined
              }}
              onClick={() => this.changeTab('broken')}
              > Broken </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>)
        }
        {
          this.state.priceArray && (
            this.state.priceArray.map((item, index) => {
              return (
                <Grid key={index}>
                  <Grid.Row style={{ height : 200, marginLeft : '2%', marginRight: '2%', borderBottom : '1px solid #16a085'}}>
                    <Grid.Column style={{width : '20%', display: 'flex', justifyContent : 'center', alignItems : 'center'}}>
                      <Image src={this.getImageUrl(item[0], this.state.selectedTab)} size='small' style={{ height : 160 }} />
                    </Grid.Column>
                    <Grid.Column style={{width : '30%', display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center'}}>
                      <h5>{item[1].name}</h5>
                      <h5>Master Weight {item[1].master_weight}</h5>
                      <h5>Rs. {item[1].Agent} / Quintal</h5>
                    </Grid.Column>
                    <Grid.Column style={{width : '30%', display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center'}}>
                      <h5>
                        Quintal
                      </h5>
                        <Input
                        type = {'number'}
                        value={item[1].quintals}
                        onChange={(e, data) => {
                          this.updateUI({ type : 'quintals', value : data.value, index, item : item[1]});
                        }}
                        placeholder='Quintal' />
                      <h5>
                        Bags
                      </h5>
                        <Input 
                        value={item[1].bags}
                        onChange={(e, data) => {
                          this.updateUI({ type : 'bags', value : data.value, index, item : item[1]});
                        }}
                        placeholder='Bags' />
                      <h5>
                        Total Price: { item[1].totalPrice }
                      </h5>
                    </Grid.Column>
                    <Grid.Column style={{width : '20%', display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center'}}>
                        <Button 
                        style={{
                          backgroundColor : item[1].addedToCart ? '#16a085' : 'coral',
                          width: "80%",
                          fontSize: 14,
                          color : 'white'
                        }}
                        onClick={e => {
                          this.toggleInCart({index})
                        }}>{ item[1].addedToCart ? "Added to Cart" : "Add to Cart"}</Button>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              );
            })
          )
        }

      </div>
    )
  }

  // <div className="cart">
  //   <Segment>
  //     { this.renderCartSummary() }
  //     { this.renderCartItems() }
  //   </Segment>
  // </div>

  renderCartSummary() {
    //dummy data
    const items = [
      { label: 'Items', value: '5' },
      { label: 'Tons', value: '31.4' },
      { label: 'Price', value: '1,40,000.00' },
    ];
    return (
      <div className="summary">
        <Statistic.Group items={items} size='mini' />
      </div>
    )
  }

  renderCartItems() {
    return(
      <Card.Group>
        <Card color='red' inverted/>
        <Card color='orange' inverted/>
        <Card color='yellow' inverted/>
        <Card color='green' inverted/>
      </Card.Group>
    );
  }


}
