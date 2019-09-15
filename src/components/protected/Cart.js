import React, { Component } from 'react';
import Lorry from './Lorry'
import { ref, getCartArray, urlToGetImage, updateCartArray } from '../../config/constants'
import { onFetchUserMobileNumber, getUserMobileNumber } from '../../helpers/auth'
import { Header, Card, Table, Modal, Message, Label, Icon, Loader, Grid, Segment, Input, Confirm, Image, Button } from 'semantic-ui-react'




// 17AUG7-ANI984-923 - temporary order for testing
// 22SEP7-ANI984-475
// 9849123866 - mobile number for testing
//  Shopwise statistic for
const SUCCESS = 'SUCCESS', ERROR = 'ERROR', VIEW_MODE = 'VIEW', EDIT_MODE = 'EDIT';

export default class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lorryCapacity: 17,
      currentLoad: 0,
      subOrders: {},
      mainOrder: {},
      acceptedOrders: [],
      notificationOpen: false,
      notificationMsg: {},
      mutatedOrderData: {
        cart: {
          discount_amount: 0,
          grossPrice: 0,
          shopDetail: [],
          totalPrice: 0,
          totalWeight: 0
        }
      },
      renderYourOrder : false,
      ownCartArray : []
    };
  }

  componentDidMount() {
    const mobile = sessionStorage.getItem('mobile');
    if(!mobile) {
      console.log('MOBILE NOT FOUND');
      onFetchUserMobileNumber().then(data => {
        console.log('MOBILE FETCHED WITH A CALL',  data.val());
        const fetchedMobile = data.val();
        this.fetchSubOrders(fetchedMobile);
      });
    } else {
      console.log('MOBILE IS ALREADY IN THE SESSION');
      this.fetchSubOrders(mobile);
    }
    //console.log(getCartArray(), "CartArray");
    let ownCartArray = getCartArray();
    let shopList = [];
    if(ownCartArray && ownCartArray.length > 0){
      ownCartArray.forEach(item => {
        if(!shopList.find(item1 => item1.shopId == item.shopId))
          shopList.push({
            shopId : item.shopId,
            shopName : item.shopName,
            ...item
          });
      })
    }
    this.setState({
      ownCartArray,
      shopList
    });
  }

  fetchSubOrders(mobile) {
    const ordersRef =  `users/${mobile}/suborders`;
    ref.child(ordersRef).once('value', (snap) => {
      this.setState({
        subOrders: snap.val()
      });
    });
  }

  getImageUrl = (key, selectedItem) => {
    return urlToGetImage + selectedItem + "_200/" + key + ".png";
  }


  openTheModal = (orderId, subAgentMobile) => this.setState({ modalOpen: true, modalOrderId: orderId, subAgentMobile, modalLoading: true }, this.fetchOrder);
  closeTheModal = () => this.setState({modalOpen:false});
  rejectOrder = (orderId, orderData) => {
    const { subOrders } = this.state;
    const {...newSubOrders} = subOrders;
    delete newSubOrders[orderData.uid][orderId];
    this.setState({
      modalOpen: false ,
      subOrders: newSubOrders
    });
    const mobile = sessionStorage.getItem('mobile');
    let deleteOrderRef = ref.child('users/' + mobile + 'suborders/' + orderData.uid + '/' + orderId);
    deleteOrderRef.remove();
  };

  acceptOrder = (orderId, orderData) => {
    const { acceptedOrders, subOrders, subAgentMobile, currentLoad, mutatedOrderData } = this.state;
    const newAcceptedOrders = [...acceptedOrders];
    const newMutatedOrderData = { ...mutatedOrderData };

    //merge two orders
    const newCart = newMutatedOrderData.cart;
    newCart['discount_amount'] = orderData.cart.discount_amount + mutatedOrderData.cart.discount_amount;
    newCart['grossPrice'] = orderData.cart.grossPrice + mutatedOrderData.cart.grossPrice;
    newCart['totalPrice'] = orderData.cart.totalPrice + mutatedOrderData.cart.totalPrice;
    newCart['totalWeight'] = orderData.cart.totalWeight + mutatedOrderData.cart.totalWeight;
    newCart.shopDetail = [...newCart.shopDetail, ...orderData.cart.shopDetail];

    orderData.orderId=orderId;
    newAcceptedOrders.push(orderData);
    const {...newSubOrders} = subOrders;
    if(newSubOrders[subAgentMobile] && newSubOrders[subAgentMobile][orderId])
      delete newSubOrders[subAgentMobile][orderId];
    const newLoad = currentLoad + (orderData.cart.totalWeight)/10;
    //const {[orderId]: ignore, ...newSubAgentOrders} = newSubOrders[subAgentMobile];

    this.setState({
      acceptedOrders: newAcceptedOrders,
      modalOpen: false,
      subOrders: newSubOrders,
      currentLoad : newLoad,
      mutatedOrderData: newMutatedOrderData
    });
  };

  notificationOpen = () => this.setState({ notificationOpen: true })
  handleNotificationConfirm = () => this.setState({ notificationOpen: false })
  handleNotificationCancel = () => this.setState({ notificationOpen: false });

  updateUI = (obj) => {
    let ownCartArray = this.state.ownCartArray;
    let { value, index, item } = obj;
    let master_weight = item.master_weight.replace("KG", "");
    if(obj.type == "bags"){
      let quintals = (master_weight * value) / 100;
      ownCartArray[index]["value"]["quintals"] = quintals;
      ownCartArray[index]["value"]["bags"] = value;
      ownCartArray[index]["value"]["totalPrice"] = quintals * item.Agent;
    }else if(obj.type == "quintals"){
      let bags = (value * 100) / master_weight;
      ownCartArray[index]["value"]["quintals"] = value;
      ownCartArray[index]["value"]["bags"] = bags;
      ownCartArray[index]["value"]["totalPrice"] = value * item.Agent;
    }
    this.setState({ ownCartArray });
  }

  renderYourOrder = () => {
    if(!this.state.shopList || this.state.shopList.length == 0)
      return null;
    return (
      <div style={{ position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              margin: 'auto', 
              backgroundColor : 'rgb(0,0,0,0.2)'}}>
                <div style={{margin: '5%',backgroundColor: 'white',padding: '2%', height: '80vh', overflowY: 'scroll'}}>
                  <div style={{ display : 'flex' }}>
                    <h2 style={{ flex : 1 }}>
                      Your order
                    </h2>
                    <div 
                    onClick = {e => {
                      this.setState(
                        { renderYourOrder : false}
                      );
                    }}
                    style={{ width : 40, height : 40, display: 'flex', right: '11%', justifyContent: 'center', alignItems: 'center', cursor : 'pointer' }}>
                      <span style={{ fontSize : 32 }}>X</span>
                    </div>
                  </div>
                  <div>
                  </div>
                  <div style={{ marginTop : 20 }}>
                    {
                        this.state.shopList.map((item, index) => {
                            return (<div key={index} style={{paddingTop : 16}}>
                              ShopName - {item.shopName}
                              {
                                this.state.ownCartArray
                                .filter((item1) => item1.shopId === item.shopId)
                                .map((item1, index) => {
                                  return (<div key={"r" + index}>
                                      <Grid key={index}>
                                        <Grid.Row style={{ height : 200, marginLeft : '2%', marginRight: '2%', borderBottom : '1px solid #16a085'}}>
                                          <Grid.Column style={{width : '20%', display: 'flex', justifyContent : 'center', alignItems : 'center'}}>
                                            <Image src={this.getImageUrl(item1.key, item1.type)} size='small' style={{ height : 160 }} />
                                          </Grid.Column>
                                          <Grid.Column style={{width : '30%', display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center'}}>
                                            <h5>{item1.name}</h5>
                                            <h5>Master Weight {item1.value.master_weight}</h5>
                                            <h5>Rs. {item1.value.Agent} / Quintal</h5>
                                          </Grid.Column>
                                          <Grid.Column style={{width : '30%', display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center'}}>
                                            <h5>
                                              Quintal
                                            </h5>
                                              <Input
                                              type = {'number'}
                                              value={item1.value.quintals}
                                              onChange={(e, data) => {
                                                this.updateUI({ type : 'quintals', value : data.value, index, item : item1.value});
                                              }}
                                              placeholder='Quintal' />
                                            <h5>
                                              Bags
                                            </h5>
                                              <Input 
                                              value={item1.value.bags}
                                              onChange={(e, data) => {
                                                this.updateUI({ type : 'bags', value : data.value, index, item : item1.value});
                                              }}
                                              placeholder='Bags' />
                                            <h5>
                                              Total Price: { item1.value.totalPrice }
                                            </h5>
                                          </Grid.Column>
                                          <Grid.Column style={{width : '20%', display: 'flex', flexDirection : 'column', justifyContent : 'center', alignItems : 'center'}}>
                                              <Button 
                                              style={{
                                                backgroundColor : 'coral',
                                                width: "80%",
                                                fontSize: 14,
                                                color : 'white'
                                              }}
                                              onClick={e => {
                                                let ownCartArray = this.state.ownCartArray;
                                                ownCartArray.splice(index, 1);
                                                this.setState({ ownCartArray });
                                              }}>{ "Remove"} </Button>
                                          </Grid.Column>
                                        </Grid.Row>
                                      </Grid>
                                  </div>)
                                })
                              }
                            </div>)
                        })
                    }
                  </div>
                  
                  <div style={{ marginTop : 20 }}>
                    <Button style={{
                      width: 150,
                      backgroundColor: 'green',
                      color: 'white',
                      fontSize: 14
                    }} onClick={e => {
                          let { shopList, ownCartArray } = this.state;
                          let obj = {
                            "isSubAgentOrder": false,
                            "orderMsg": "",
                            "priority": 1,
                            "status": "received",
                            "time": new Date().getTime(),
                            "uid": new Date().getTime(),
                            "userName": window.sessionStorage.name,
                            "orderId": new Date().getTime()
                          };
                          let cartDetail = {
                            "discount_amount": 0,
                            "grossPrice": 0,
                            "selectedLorrySize": 0,
                            "totalPrice": 0,
                            "totalWeight": 0
                          };
                          let shopArray = [];
                          for(let index = 0; index < shopList.length; index++){
                              // item related to one shop
                              let arr = ownCartArray.filter(item => item.shopId == shopList[index].shopId);
                              let shopObj = {
                                "address": arr[0].address,
                                "areaId": arr[0].areaId,
                                "areaName": arr[0].areaName,
                                "city": arr[0].city,
                                "district": arr[0].district,
                                "mobile": arr[0].mobile,
                                "name": arr[0].name,
                                "shopDiscountAmount": 0,
                                "shopGrossAmount": 0,
                                "tin": arr[0].tin,
                                "totalShopPrice": 0,
                                "totalWeight": 0,
                                "gst": arr[0].gst
                              };
                              let items = { rice : {}, ravva : {}, roken : {}};
                              for(let index = 0; index < arr.length; index++){
                                let obj = arr[index];
                                let master_weight = obj["value"]["master_weight"];
                                master_weight = master_weight.replace("KG", "");
                                let price = obj["value"]["Agent"] * (master_weight * obj["value"]["bags"] / 100);
                                shopObj.shopGrossAmount += price;
                                shopObj.totalPrice += price;
                                shopObj.totalWeight += (obj["value"]["bags"] * master_weight) / 100;
                                let key =  obj["key"];
                                if(obj.type == "rice"){
                                  items.rice[key] = {
                                    "bags": obj["value"]["bags"],
                                    "discountedQuintalPrice": 0,
                                    "masterWeightPrice": obj["value"]["Agent"] * (master_weight / 100),
                                    "name": obj["value"]["name"],
                                    "price": price,
                                    "quintalWeightPrice": obj["value"]["Agent"],
                                    "weight": (obj["value"]["bags"] * master_weight) / 100
                                  }
                                }else if(obj.type == "ravva"){
                                  items.ravva[key] = {
                                    "bags": obj["value"]["bags"],
                                    "discountedQuintalPrice": 0,
                                    "masterWeightPrice": obj["value"]["Agent"] * (master_weight / 100),
                                    "name": obj["value"]["name"],
                                    "price": price,
                                    "quintalWeightPrice": obj["value"]["Agent"],
                                    "weight": master_weight
                                  }
                                }else if(obj.type == "broken"){
                                  items.broken[key] = {
                                    "bags": obj["value"]["bags"],
                                    "discountedQuintalPrice": 0,
                                    "masterWeightPrice": obj["value"]["Agent"] * (master_weight / 100),
                                    "name": obj["value"]["name"],
                                    "price": price,
                                    "quintalWeightPrice": obj["value"]["Agent"],
                                    "weight": master_weight
                                  }
                                }
                              }
                              shopObj["items"] = items;
                              shopArray.push(shopObj);
                          }
                          cartDetail["shopDetail"] = shopArray;
                          for(let i = 0; i < shopArray.length; i++){
                            cartDetail.grossPrice += shopArray[i].shopGrossAmount;
                            cartDetail.totalPrice += shopArray[i].totalPrice;
                            cartDetail.totalWeight += shopArray[i].totalWeight;
                            cartDetail.selectedLorrySize += this.state.lorryCapacity;
                          }
                          obj["cart"] = cartDetail;

                          this.setState({ shopList : [], ownCartArray : [] });
                          updateCartArray([]);
                          this.acceptOrder("orderId", obj);

                  }}> Accept </Button>
                  </div>
                
                </div>
            </div>
    );
  }



  render() {
    const { currentLoad } = this.state;
    const { modalOrderId, modalOpen, modelOrderData, modalLoading } = this.state;
    const notificationConfirmLink = <a href={`view/${this.state.notificationOrderId}`} target="_blank"><strong>Take me to Order</strong></a>;
    // <Input label={`currentLoad`} placeholder='currentLoad' width={4} onChange={ this.onChangeValue.bind(this, 'currentLoad')} value={currentLoad} />


    return (
      <div className="cart head" style={{position : 'relative'}}>
        <Confirm
          basic
          open={this.state.notificationOpen}
          content={this.state.notificationMsg}
          cancelButton='Return to Cart'
          confirmButton={notificationConfirmLink}
          onCancel={this.handleNotificationCancel}
          onConfirm={this.handleNotificationConfirm}
        />
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Segment className="lorry">
                <Lorry {...this.state} onChange={ this.onChangeValue.bind(this, 'lorryCapacity') } onSubmit={ this.submitOrder.bind(this) } />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row className="items">
            <Grid.Column width={6}>
              <Segment className="fieldAgentOrders">
                <Header as='h5' textAlign='center'>
                  Field Agents Orders
                </Header>
                { this.renderSubOrders() }
                <Button style={{
                  width : '100%',
                  backgroundColor : '#2185d0'
                }} onClick={e => {
                  this.setState({
                    renderYourOrder : true
                  });
                }}>View Your Order</Button>
                {/* { this.renderViewOrderModal() } */}
              </Segment>
            </Grid.Column>
            <Grid.Column width={10}>
              <Segment className="currentOrder">
                <Header as='h5' textAlign='center'>
                  CURRENT ORDER
                </Header>
                { this.renderAcceptedOrders() }
                <div className='helpText'>
                  <Icon name='pointing right' />Lorry will be loaded in the same order as above. Last item will be unloaded first
                </div>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        
        {
          modalOpen && (
            <div style={{ position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              margin: 'auto', 
              backgroundColor : 'rgb(0,0,0,0.2)'}}>
                <div style={{margin: '5%',backgroundColor: 'white',padding: '2%'}}>
                  <div style={{ display : 'flex' }}>
                    <h2 style={{ flex : 1 }}>
                      Details of order : [ <span className="head">{ modalOrderId }</span> ]
                    </h2>
                    <div 
                    onClick = {e => {
                      this.closeTheModal();
                    }}
                    style={{ width : 40, height : 40, display: 'flex', right: '11%', justifyContent: 'center', alignItems: 'center', cursor : 'pointer' }}>
                      <span style={{ fontSize : 32 }}>X</span>
                    </div>
                  </div>
                  <div>
                  { this.renderOrderShopsAndItems(modelOrderData) }
                  </div>
                  <div style={{ marginTop : 20 }}>
                    <Button primary content='CLOSE' onClick={ this.closeTheModal.bind(this) } />
                    <Button negative content='REJECT' onClick={this.rejectOrder.bind(this,modalOrderId,modelOrderData)} />
                    <Button positive icon='checkmark' labelPosition='right' content='ACCEPT' onClick={this.acceptOrder.bind(this,modalOrderId,modelOrderData)} />
                  </div>
                </div>
            </div>
          )
        }
        
        {
          this.state.renderYourOrder && this.renderYourOrder()
        }
      </div>
    )
  };

  renderViewOrderModal() {
    const { modalOrderId, modalOpen, modelOrderData, modalLoading } = this.state;
    if(modalLoading) {
      return <Loader active inline='centered' size='massive'/>
    }

    if(this.state.modalOpen){
      return (
      <div style={{ position : "absolute", justifyContent : 'center', alignItems : 'center'}}>
          <h2>
            Details of order : [ <span className="head">{ modalOrderId }</span> ]
          </h2>
          <div>
          { this.renderOrderShopsAndItems(modelOrderData) }
          </div>
          <div>
            <Button primary content='CLOSE' onClick={ this.closeTheModal.bind(this) } />
            <Button negative content='REJECT' onClick={this.rejectOrder.bind(this,modalOrderId,modelOrderData)} />
            <Button positive icon='checkmark' labelPosition='right' content='ACCEPT' onClick={this.acceptOrder.bind(this,modalOrderId,modelOrderData)} />
          </div>
      </div>
      );
    }

    return (
      <Modal  open={modalOpen} onClose={this.closeTheModal.bind(this)} className="viewModal">
        <Modal.Header>
          Details of order : [ <span className="head">{ modalOrderId }</span> ]
        </Modal.Header>
        <div>
          { this.renderOrderShopsAndItems(modelOrderData) }
        </div>
        <Modal.Actions>
          <Button primary content='CLOSE' onClick={ this.closeTheModal.bind(this) } />
          <Button negative content='REJECT' onClick={this.rejectOrder.bind(this,modalOrderId,modelOrderData)} />
          <Button positive icon='checkmark' labelPosition='right' content='ACCEPT' onClick={this.acceptOrder.bind(this,modalOrderId,modelOrderData)} />
        </Modal.Actions>
      </Modal>
    );
  }

  // Rendering functions should just return JSX
  // No backend calls

  fetchOrder() {
    const { modalOrderId } = this.state;
    const ordersRef =  ref.child(`orders/${modalOrderId}`);

    ordersRef.on('value', (data) => {
      //console.log('modelOrderData=', data.val());
      const orderData = data.val();
      this.updatePrices(orderData, 'modelOrderData');
    });
  }


  updatePrices(orderData, stateProp) {
    const pricesRef = ref.child(`priceList`);
    pricesRef.on('value', (data) => {
      let priceList = data.val();
      this.calculateDiscount(orderData, priceList, stateProp);
    });
  }

  calculateDiscount(orderData, priceList, stateProp) {
    const shopArray = orderData.cart.shopDetail;
    orderData.cart.discount_amount = 0;

    let totaldiscountedPrice = 0; let itemsProcessed = 0;

    const that = this;
    shopArray.forEach( shop => {

    var shopDiscountAmount = 0;

    var items = shop.items;
    var riceObjectOrg = items.rice;
    var ravvaObjectOrg = items.ravva;
    var brokenObjectOrg = items.broken;
    var shopRiceWeight = 0;var shopRavvaWeight = 0; var shopBrokenWeight= 0;
    for(var productId in riceObjectOrg){
        shopRiceWeight += parseFloat(riceObjectOrg[productId].weight);
    }
    for(var productId in ravvaObjectOrg){
        shopRavvaWeight += parseFloat(ravvaObjectOrg[productId].weight);
    }
    for(var productId in brokenObjectOrg){
        shopBrokenWeight += parseFloat(brokenObjectOrg[productId].weight);
    }
    var ricediscount=0, ravvadiscount=0,brokendiscount=0;

    var areasRef = ref.child('areas/' + shop.areaId );
    var riceDiscArray = [];var ravvaDiscArray = []; var brokenDiscArray=[];
    (
      function() {

        var ravvaObject = ravvaObjectOrg ? JSON.parse(JSON.stringify(ravvaObjectOrg)) : {};
        var riceObject = riceObjectOrg ? JSON.parse(JSON.stringify(riceObjectOrg)): {};
        var brokenObject = brokenObjectOrg ? JSON.parse(JSON.stringify(brokenObjectOrg)): {};

        areasRef.once('value', (data)=> {
          itemsProcessed++;
          var discounts = data.val().discounts;
          if(discounts) {
            riceDiscArray = discounts.rice || riceDiscArray ;
            ravvaDiscArray = discounts.ravva ||  ravvaDiscArray;
            brokenDiscArray = discounts.broken || brokenDiscArray;
          }

          riceDiscArray.forEach((entry) => {
            if(shopRiceWeight >= entry.quintals){
              ricediscount = entry.discount;
            }
          });

          ravvaDiscArray.forEach((entry) => {
            if(shopRavvaWeight >= entry.quintals){
              ravvadiscount = entry.discount;
            }
          });

          brokenDiscArray.forEach((entry) => {
            if(shopBrokenWeight >= entry.quintals){
              brokendiscount = entry.discount;
            }
          });

          let areaId = shop.areaId ;

          for(var productId in riceObject){
            riceObject[productId].quintalWeightPrice=priceList[areaId]['rice'][productId]['Agent'];
            riceObject[productId]['discountedQuintalPrice']=  riceObject[productId].quintalWeightPrice - ricediscount;
            riceObject[productId]['price']= riceObject[productId].discountedQuintalPrice * riceObject[productId]['weight'];
            shopDiscountAmount += ricediscount*riceObject[productId]['weight'];
            totaldiscountedPrice += ricediscount*riceObject[productId]['weight']
          }
          for(var productId in ravvaObject){
            ravvaObject[productId].quintalWeightPrice=priceList[areaId]['ravva'][productId]['Agent'];
            ravvaObject[productId]['discountedQuintalPrice']= ravvaObject[productId].quintalWeightPrice - ravvadiscount;
            ravvaObject[productId]['price']= ravvaObject[productId].discountedQuintalPrice * ravvaObject[productId]['weight']
            shopDiscountAmount += ravvadiscount*ravvaObject[productId]['weight'];
            totaldiscountedPrice += ravvadiscount*ravvaObject[productId]['weight'];
          }

          for(var productId in brokenObject){
            brokenObject[productId].quintalWeightPrice=priceList[areaId]['broken'][productId]['Agent'];
            brokenObject[productId]['discountedQuintalPrice']=  brokenObject[productId].quintalWeightPrice - brokendiscount;
            brokenObject[productId]['price']= brokenObject[productId].discountedQuintalPrice * brokenObject[productId]['weight']
            shopDiscountAmount += brokendiscount*brokenObject[productId]['weight'];
            totaldiscountedPrice += brokendiscount*brokenObject[productId]['weight'];
          }

          shop['items']['rice'] = riceObject;
          shop['items']['ravva'] = ravvaObject;
          shop['items']['broken'] = brokenObject;

          shop['shopDiscountAmount'] = shopDiscountAmount;
          shop['shopGrossAmount'] = shop['totalShopPrice'] - shopDiscountAmount;
          if(itemsProcessed == shopArray.length) {
            //console.log('order data = = = ' , orderData);
            orderData.cart.discount_amount = totaldiscountedPrice;
            that.setState({
              [stateProp]: orderData,
              modalLoading: false
            })
          }
        })
      }());
    });
  }

  renderSubOrders() {
    const { subOrders } = this.state;
    if(!subOrders || subOrders == null) {
      return <Message key='noSubAgentOrder' floating content='No sub agent orders!'  color='orange' />;
    }

    const subOrdersList = [];
    const that = this;
    Object.keys(subOrders).forEach(key => {
      const singleSubAgentOrders = subOrders[key];
      Object.keys(singleSubAgentOrders).forEach(function(orderId) {
        const orderDetails = singleSubAgentOrders[orderId];
        const split = orderDetails.split(`;`);
        const agentName = split[0];
        const shopName = split[1];
        subOrdersList.push(
          <div key={orderId} className="subAgentOrders">
            <Card fluid key={orderId}>
              <Card.Content>
                <Card.Header>
                  {agentName}
                </Card.Header>
                <Card.Meta>
                  {orderId}
                </Card.Meta>
                <Card.Description>
                  { shopName }
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button primary fluid onClick={that.openTheModal.bind(that,orderId, key)}>VIEW</Button>
              </Card.Content>
            </Card>
          </div>
        )
      });
    });
    if(!subOrdersList.length) {
      subOrdersList.push(
        <Message floating content='No sub agent orders!'  color='orange' key='subOrderMsg'/>
      );
    }
    return subOrdersList;
  }

  renderAcceptedOrders() {

    const { acceptedOrders, mutatedOrderData={} } = this.state;
    if(!acceptedOrders) {
      return null;
    }
    const orderedShops = mutatedOrderData.cart ? mutatedOrderData.cart.shopDetail : [];
    const acceptedOrderShopsList = [];

    acceptedOrderShopsList.push(
      <div className="subAgentOrder" key={1}>
        { this.renderShops() }
      </div>
    );

    if(!orderedShops.length) {
      acceptedOrderShopsList.push(
        <Message key='acceptedOrderMsg' color='orange' floating content='No itesms in the cart. View/Accept sub-agent orders on left to place an order to the Factory!' />
      );
    }
    return acceptedOrderShopsList;
  }

  renderShops() {
    const { mutatedOrderData={} } = this.state;
    const orderedShops = mutatedOrderData.cart ? mutatedOrderData.cart.shopDetail : [];
    const totalShops = orderedShops.length;
    const shopsList = [];
    orderedShops.forEach((shop, index) => {
      const { name, mobile, shopGrossAmount,shopDiscountAmount, totalWeight, items, areaId, tin } = shop;
      shopsList.push(
          <Card fluid key={index}>
            <Card.Content>
              <Card.Header as='h1'>
                {name}, {areaId}, GST:{tin}
              </Card.Header>
              <Card.Meta>
                <span style={ { fontSize : '44px'} }>
                  {mobile}
                </span>
              </Card.Meta>
              <Card.Description>
                { this.renderItemsTable(index, items, EDIT_MODE) }
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Header as='h3' textAlign='right' inverted>
                <span className="price">{`₹${shopGrossAmount.toLocaleString('en-IN')} `}</span>/<span className="quantity">{ `${totalWeight} qnts`}</span>
              </Header>
            <Card.Meta textAlign='right' className="discount">
              <Button.Group floated='left' className="sequence">
                <Button color='black'>
                  <Icon name='hashtag' /> {index + 1}
                </Button>
                { (index + 1) !== totalShops
                  ? <Button animated secondary onClick={this.swapShops.bind(this, index, index + 1)}>
                      <Icon name='arrow down' size='big'/>
                    </Button>
                  : null
                }
                { index !== 0
                  ? <Button animated secondary onClick={this.swapShops.bind(this, index, index - 1)}>
                      <Icon name='arrow up' size='big'/>
                    </Button>
                  : null
                }
              </Button.Group>
              <span>discount:</span><span className="quantity">{`₹${shopDiscountAmount.toLocaleString('en-IN')}`}</span>
            </Card.Meta>
          </Card.Content>
        </Card>
      )
    });
    return shopsList;
  }

  swapShops(fromIndex, toIndex) {
    const { mutatedOrderData } = this.state;
    const orderedShops = mutatedOrderData.cart.shopDetail;
    const newOrderedShops = [ ...orderedShops];
    const temp = newOrderedShops[fromIndex];
    newOrderedShops[fromIndex] = newOrderedShops[toIndex];
    newOrderedShops[toIndex] = temp;

    const newMutatedOrderData = { ...mutatedOrderData };
    newMutatedOrderData.cart.shopDetail = newOrderedShops;
    this.setState({
      mutatedOrderData: newMutatedOrderData
    });
  }

  renderOrderShopsAndItems(orderData) {
    if(!orderData) {
      return null;
    }

    const shops = orderData.cart.shopDetail;
    const shopsList = [];
    shops.forEach((shop, index) => {
      const { name, mobile, shopGrossAmount,shopDiscountAmount, totalWeight, items, areaId, tin } = shop;
      shopsList.push(
          <Card fluid key={index}>
            <Card.Content>
              <Card.Header>
                {name}, {areaId}, GST:{tin}
              </Card.Header>
              <Card.Meta>
                {mobile}
              </Card.Meta>
              <Card.Description>
                { this.renderItemsTable(index, items) }
              </Card.Description>
            </Card.Content>
            <Card.Content extra>
              <Header as='h3' textAlign='right' inverted>
                <span className="price">{`₹${shopGrossAmount.toLocaleString('en-IN')} `}</span>/<span className="quantity">{ `${totalWeight} qnts`}</span>
            </Header>
            <Card.Meta textAlign='right' className="discount">
              <Button.Group floated='left' className="sequence">
                <Button color='black'>
                  <Icon name='hashtag' /> {index + 1}
                </Button>
                <Button animated secondary>
                  <Icon name='arrow down' size='big'/>
                </Button>
                <Button animated secondary>
                  <Icon name='arrow up' size='big'/>
                </Button>
              </Button.Group>

              <span>discount:</span><span className="quantity">{`₹${shopDiscountAmount.toLocaleString('en-IN')}`}</span>
            </Card.Meta>
          </Card.Content>
        </Card>
      )
    });
    return shopsList;
  }

  renderItemsTable(shopIndex, items, mode) {
    const itemsArray = [];
    Object.keys(items).forEach( productType => {
      const productTypeItems = items[productType];
      Object.keys(productTypeItems).forEach( product => {
        const { name, bags, weight, quintalWeightPrice, discountedQuintalPrice, price } = productTypeItems[product];
        const discount = quintalWeightPrice - discountedQuintalPrice;
        itemsArray.push(
          <Table.Row key={product} style={ {fontSize :'24px'} }>
            <Table.Cell textAlign='left'>{name}</Table.Cell>
            <Table.Cell textAlign='center'>
              { this.renderValueEditControls(mode, 'bags', bags, shopIndex, productType, product) }
            </Table.Cell>
            <Table.Cell textAlign='center' className='bigger'>
              { this.renderValueEditControls(mode, 'weight', weight, shopIndex, productType, product) }
            </Table.Cell>
            <Table.Cell textAlign='right'>{parseFloat(quintalWeightPrice).toLocaleString('en-IN')}(<strong>{discount}</strong>)</Table.Cell>
            <Table.Cell textAlign='right'>{price.toLocaleString('en-IN')}</Table.Cell>
          </Table.Row>
        )
      })
    });


    return (
      <Table striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign='left'>Product</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Bags</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Qnts</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Qnt Price(disc)</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Total Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { itemsArray }
        </Table.Body>
      </Table>
    );
  }

  // <Button.Group floated='left' className="sequence">
  //   <Button>
  //     <Icon name='plus'/>
  //   </Button>
  //   <Button className='number'>
  //     <Input value={value} type='number'/>
  //   </Button>
  //   <Button>
  //     <Icon name='minus'/>
  //   </Button>
  // </Button.Group>

  renderValueEditControls(mode, valueType, value, shopIndex, productType, itemIndex) {
    if(mode === EDIT_MODE) {
      return (
        <Label as='div' className='numberEdit'>
          <Input size='big' className='number' type='number' value={value} onChange={this.onChangeNumber.bind(this, shopIndex, productType, itemIndex, valueType)}/>
        </Label>
      );
    }
    return value;
  }

  // onChangeButtonClicked(shopIndex, productType, itemIndex, action, e) {
  //   alert(`shopIndex=${shopIndex}, action=${action} changedValeu=${e.target.value}`);
  // }

  onChangeNumber(shopIndex, productType, itemIndex, valueType, e) {
    const newOrderedShops = [ ...this.state.mutatedOrderData.cart.shopDetail ];
    const currentItem = newOrderedShops[shopIndex].items[productType][itemIndex];
    const { bags, weight, quintalWeightPrice, masterWeightPrice, price } = currentItem;
    const bagsToWeightRation = Math.round(parseFloat(quintalWeightPrice)/parseFloat(masterWeightPrice));
    if(valueType === 'bags') {
      currentItem[valueType] = e.target.value;
      currentItem['weight'] = e.target.value/bagsToWeightRation;

    } else if (valueType === 'weight') {
      currentItem[valueType] = e.target.value;
      currentItem['bags'] = e.target.value*bagsToWeightRation;
    }
    currentItem['price'] = currentItem['weight']*quintalWeightPrice;
    //console.log(currentItem);
    const shop = newOrderedShops[shopIndex];
    const { totalWeight, totalPrice } = this.getTotalPriceAndWeight(shop.items);
    shop.totalWeight = totalWeight;
    shop.totalShopPrice = totalPrice;


    const newMutatedOrderData = { ...this.state.mutatedOrderData };
    newMutatedOrderData.cart.shopDetail = newOrderedShops;
    this.updatePrices(newMutatedOrderData, 'mutatedOrderData');
    // this.setState({
    //   mutatedOrderData: newMutatedOrderData
    // }, updatePrices());
    this.updateTotalLoad(newOrderedShops);
  }

  updateTotalLoad(newOrderedShops) {
    let totalLoad = 0;
    newOrderedShops.forEach( shop => {
      totalLoad += parseFloat(shop.totalWeight);
    });
    this.setState({
      currentLoad: totalLoad/10
    });
  }

  getTotalPriceAndWeight(items) {
    let totalWeight = 0, totalPrice = 0;
    Object.keys(items).forEach(productType => {
      const products = items[productType];
      Object.keys(products).forEach(product => {
        let { weight, price } = products[product];
        weight = weight || 0;
        totalWeight += parseFloat(weight);
        totalPrice += parseFloat(price);
      });
    });
    return {
      totalWeight,
      totalPrice
    };
  }

  onChangeValue(inputName, e, data) {
    const { value } = data;
    this.setState({
      [inputName]: value ? parseFloat(value) : 0
    });
  }

  submitOrder( info, e, data) {
    const { acceptedOrders, currentLoad , lorryCapacity } = this.state;
    const uid = sessionStorage.getItem('mobile');
    const userName = sessionStorage.getItem('name');
    //TODO
    let now = new Date(),
        orderMsg = info.orderMsg;
    let newOrder = {
      uid,
      time : now.getTime(),
      userName : userName,
      status : "received",
      priority : (now * -1),
      orderMsg : orderMsg,
      isSubAgentOrder : false
    };

    let mycart = {
      discount_amount : 0,
      grossPrice : 0,
      totalPrice : 0,
      selectedLorrySize : lorryCapacity,
      totalWeight : currentLoad*10,
      shopDetail : []
    };

    acceptedOrders.forEach((order) => {
      let cart = order.cart;
      mycart.discount_amount += cart.discount_amount;
      mycart.grossPrice += cart.grossPrice;
      mycart.totalPrice += cart.totalPrice;
      //mycart.shopDetail= mycart.shopDetail.concat(cart.shopDetail);
    });
    mycart.shopDetail = this.state.mutatedOrderData.cart.shopDetail;


    newOrder['cart']=mycart;
    //console.log(newOrder);

    var monthsText=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    var mathRandom = Math.floor((Math.random())*1000);

    var orderId= (now.getDate()).toString()  + monthsText[now.getMonth()] + (now.getYear()%10).toString() + '-'+
              userName.substring(0,3).toUpperCase() + uid.substring(0,3) +'-'+ mathRandom.toString();


    var usersRef = ref.child('users/' + uid );
    usersRef.once('value', function(data){
      var userValue = data.val();
      userValue["orders"] = userValue["orders"] || [];
      userValue["orders"].push(orderId);
      var promise = usersRef.update(userValue);
    }).catch(function(e){
      console.log(e);
    });


    let ordersRef = ref.child('orders/' + orderId);
    let promise = ordersRef.set(newOrder);
    let that = this;
    promise
    .then(e => {
      //  that.sendSMS(mycart);
      that.deleteSubAgentOrders(mycart);
      this.showNotificationMsg(SUCCESS, orderId);
    })
    .catch(e => {
      console.log('Some problem occured while submitting the order',"Sorry!!")
      this.showNotificationMsg(ERROR, orderId);
    });


    var orderListRef = ref.child('orderList');

    orderListRef.transaction(orders => {
      orders=orders||[];
      orders.push(orderId);
      return orders;
    });

  }

  showNotificationMsg(notificationType, orderId) {
    let msg = '';
    if(notificationType === SUCCESS) {
      msg = <p>Order <a href={`view/${orderId}`} target="_blank"><strong>{orderId}</strong> </a>   is successfully placed. Check Orders tab for updates </p>;
    } else {
      msg = <p>Unable to submit order <a href={`view/${orderId}`} target="_blank"><strong>{orderId}</strong></a>. Contact Lalitha Industries. </p>;
    }
    this.setState({
      notificationMsg: msg,
      notificationOpen: true,
      currentLoad: 0,
      notificationOrderId: orderId,
      mutatedOrderData: {
        cart: {
          discount_amount: 0,
          grossPrice: 0,
          shopDetail: [],
          totalPrice: 0,
          totalWeight: 0
        }
      }
    });
  }

  deleteSubAgentOrders(myCart) {
    const { acceptedOrders } = this.state;
    const mobile = sessionStorage.getItem('mobile');
    if(!mobile) {
      console.log('MOBILE NOT FOUND');
      onFetchUserMobileNumber().then(data => {
        console.log('MOBILE FETCHED WITH A CALL',  data.val());
        const fetchedMobile = data.val();
        acceptedOrders.forEach((order) => {
            let subAgentMobileNumber = order.uid;
            let subAgentOrderId = order.orderId;
            let mainAgentRef = ref.child('users/' + fetchedMobile + '/suborders/' +
              subAgentMobileNumber + '/' +subAgentOrderId );
            mainAgentRef.remove();
        });
        this.setState({acceptedOrders : []});
      });
    } else {
      console.log('MOBILE IS ALREADY IN THE SESSION');
      acceptedOrders.forEach((order) => {
          let subAgentMobileNumber = order.uid;
          let subAgentOrderId = order.orderId;
          let mainAgentRef = ref.child('users/' + mobile + '/suborders/' +
            subAgentMobileNumber + '/' +subAgentOrderId );
          mainAgentRef.remove();
      });
      this.setState({acceptedOrders : []});
    }
  }


  sendSMS(myCart) {
              var smsURL = 'https://www.google.com';
              myCart.shopDetail.forEach(function(shop,index){
                  var shopName = shop.name || "";
                  var text = "Dear " + shopName + "! \nYour order has been  placed successfully.";
                  var mobile = shop.mobile;
                  var objectOfAllItems = this.jsonConcat(shop.items.rice || {},shop.items.ravva || {}) || {};
                  objectOfAllItems = this.jsonConcat(objectOfAllItems,shop.items.broken || {}) || {};
                  text += "Total Weight = " + shop.totalWeight +" Quintals\n";
                  text += "We will deliver your goods as soon as possible.\n Thank-you!";
                  var obj = {};
                  obj[mobile] = text;
                 if(smsURL) {
                     this.makeCorsRequest(smsURL,obj);
                 }
              });
    }


    // Make the actual CORS request.
   makeCorsRequest(smsURL,object) {
             var xhr = this.createCORSRequest('POST', smsURL);
             if (!xhr) {
               return;
             }

             var params = JSON.stringify(object);
             xhr.send(params);

     }


     // Create the XHR object.
    createCORSRequest(method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
              // XHR for Chrome/Firefox/Opera/Safari.
              xhr.open(method, url, true);
            } else if (typeof XDomainRequest != "undefined") {
              // XDomainRequest for IE.
              xhr = new XDomainRequest();
              xhr.open(method, url);
            } else {
              // CORS not supported.
              xhr = null;
            }
            xhr.setRequestHeader("Content-Type", "application/json");

            return xhr;
      }

     jsonConcat(o1, o2) {
               for (var key in o2) {
                   o1[key] = o2[key];
               }
               return o1;
    }


}
