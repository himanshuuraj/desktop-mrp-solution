import React, { Component } from 'react'
import { Grid, Segment, Statistic, Card, Message, Dropdown } from 'semantic-ui-react'
import Product from './Product';
import { getShops, getPrice, getProduct } from "./../../helpers/db";
import { urlToGetImage } from "./../../config/constants";


export default class Cart extends Component {


  /**
  Car shows up only if there items added
  */

  constructor(props){
    super(props);
    this.state = {
      shops : [],
      prices : undefined,
      productsList : {}
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
    this.getproductData();
    this.getShopData();
  }

  changePriceForm = (prices) => {
      let ravvaPrice = prices.ravva || {};
      let ricePrice = prices.rice || {};
      let brokenPrice = prices.brokenPrice || {};

      let productsList = this.state.productsList;
      let ravvaProduct = productsList.ravva || {};
      let riceProduct = productsList.rice || {};
      let brokenProduct = productsList.broken || {};

      Object.entries(ravvaPrice).map((item, index) => {
        item[1]['master_weight'] = ravvaProduct[item[0]].master_weight;
        item[1]["name"] = ravvaProduct[item[0]].name;
      });

      Object.entries(ricePrice).map((item, index) => {
        item[1]['master_weight'] = riceProduct[item[0]].master_weight;
        item[1]["name"] = riceProduct[item[0]].name;
      });

      Object.entries(brokenPrice).map((item, index) => {
        item[1]['master_weight'] = brokenProduct[item[0]].master_weight;
        item[1]["name"] = brokenProduct[item[0]].name;
      });


      this.setState({ prices });
      console.log(prices, "Prices");
  }

  handleChange = (e, { value }) => {
    this.setState({ selectedShop : value });
    console.log(value.areaId);
    getPrice(value.areaId).then((data) => {
      let prices = data.val();
      this.changePriceForm(prices);
    });
  }

  render() {
    return (
      <div className="buy head">
        <h1>Products</h1>
        <Message visible className="blink">This page is under construction. DO NOT USE</Message>
        {
          this.state.shops && this.state.shops.length > 0 && <h2>Select Shop</h2>
        }
        {
          this.state.shops && this.state.shops.length > 0 && (
            <Dropdown
              placeholder='Select Friend'
              fluid
              selection
              onChange={this.handleChange}
              options={this.state.shops}
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
