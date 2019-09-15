import React, { Component } from 'react'
import { Card, Table, Header, Divider, Loader, Button } from 'semantic-ui-react'
import moment from 'moment';
import { Link } from 'react-router-dom'
import { ref } from '../../config/constants'

const LOADING = 'loading';

export default class OrderDetails extends Component {

  constructor(props) {
    super(props);
    this.orderId = props.match.params.orderId;
    this.state = {
      orderData: LOADING
    }
  }

  componentDidMount() {
    const refPath = `orders/${this.orderId}`;
    ref.child(refPath).once('value', (snap) => {
      const orderData = snap.val();
      //check for ownership using UID. Don't show the order if user doesnt own it
      this.setState({
        orderData
      });
    });
  }

  render() {

    if(this.state.orderData === LOADING) {
      return (
        <div>
          <Link to='/orders'>BACK TO ORDERS</Link>
          <Loader active inline='centered' size='massive'/>
        </div>
      );
    }

    return (
      <div className="orderDetails">
        <Link to='/orders'>BACK</Link>
        { this.renderMainOrder() }
      </div>
    )
  }

  renderMainOrder() {
    return (
      <div>
        { this.renderOrderShopsAndItems(this.state.orderData) }
        { this.renderSpecialMsg(this.state.orderData.orderMsg) }
      </div>
    );
  }

  renderSpecialMsg(orderMsg) {
    return (
      orderMsg ?
      <div className='splMsg'>
        <Divider />
        <h5>SPECIAL MESSAGE</h5>
        <p>{orderMsg}</p>
      </div>
      :
      null
    );
  }

  renderOrderShopsAndItems(orderData) {
    if(orderData === LOADING) {
      return null;
    }

    const { discount_amount, totalPrice, grossPrice, shopDetail, selectedLorrySize, totalWeight } = orderData.cart;
    const totalPriceFixed = (+totalPrice).toFixed(2);
    const totalDiscount = (+discount_amount).toFixed(2);
    const totalWeightInTons = (+totalWeight)/10;
    let weightStatusColor = '#40bf80';
    if(totalWeightInTons > (+selectedLorrySize)) {
      weightStatusColor = '#ff3333';
    }

    const { time, status } = this.state.orderData;
    const orderDate = new Date(time);
    const dateFromNow = moment(orderDate).fromNow();
    const dateFormatted = moment(orderDate).format('DD/MM/YY h:mm:ssa');

    const shops = orderData.cart.shopDetail;
    const shopsList = [];
    shops.forEach((shop, index) => {
      const { name, mobile, shopGrossAmount = 0, totalWeight, items } = shop;
      shopsList.push(
          <Card fluid key={index}>
          <Card.Content>
            <Card.Header>
              {name}
            </Card.Header>
            <Card.Meta>
              {mobile}
            </Card.Meta>
            <Card.Description>
              { this.renderItemsTable(items) }
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Header as='h2' textAlign='right' inverted>
            <span className='price'>{`₹${shopGrossAmount.toLocaleString('en-IN')}`}</span><span className='quantity'>{` / ${totalWeight} qnts`}</span>
          </Header>
          </Card.Content>
        </Card>
      )
    });
    return (
      <div className="cart">
        <div className="summary">
          <h2>{ this.orderId }</h2>
          <h5>placed <span>{dateFromNow}</span> at <strong>{dateFormatted}</strong> </h5>
          <Divider />
          <Button fluid>{`Order is ${status}`}</Button>
          <Divider />
          <table>
            <tr>
              <td className="key">Total Price<span>:</span></td>
              <td className="value"><strong>₹{parseFloat(totalPriceFixed).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
            <tr>
              <td className="key">Total Discount<span>:</span></td>
              <td className="value"><strong>₹{parseFloat(totalDiscount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
            <tr>
              <td className="key">Total Order Weight<span>:</span></td>
              <td className="value"><strong>{totalWeightInTons.toFixed(2)}</strong> tons </td>
            </tr>
            <tr>
              <td className="key">Vehicle Capacity<span>:</span></td>
              <td className="value"><strong style={{color: weightStatusColor}}>{selectedLorrySize}</strong> tons</td>
            </tr>
          </table>
          <Divider />
        </div>
        <div className="shopsDetails">
          { shopsList }
        </div>
      </div>
    );
  }

  renderItemsTable(items) {
    const itemsArray = [];
    Object.keys(items).forEach( productType => {
      const productTypeItems = items[productType];
      Object.keys(productTypeItems).forEach( product => {
        const { name, bags, weight, discountedQuintalPrice = 0, price = 0, quintalWeightPrice = 0 } = productTypeItems[product];
      //  let discount = quintalWeightPrice - discountedQuintalPrice;
      let discount=0;
        if(discount) {
          discount.toFixed(2);
        }
        const grossPrice = quintalWeightPrice*weight;
        itemsArray.push(
          <Table.Row key={product}>
            <Table.Cell textAlign='left'>{name}</Table.Cell>
            <Table.Cell textAlign='right'>{bags}</Table.Cell>
            <Table.Cell textAlign='right'>{weight}</Table.Cell>
            <Table.Cell textAlign='right'>{quintalWeightPrice.toLocaleString('en-IN')}</Table.Cell>
            <Table.Cell textAlign='right'>{grossPrice.toLocaleString('en-IN')}</Table.Cell>
            <Table.Cell textAlign='right'>{discount}</Table.Cell>
            <Table.Cell textAlign='right'>{price.toLocaleString('en-IN')}</Table.Cell>
          </Table.Row>
        )
      })
    })


    return (
      <Table striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign='left'>Product</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Bags</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Qnts</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Qnt Price</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Actual Price</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Discount/Qntl</Table.HeaderCell>
            <Table.HeaderCell textAlign='right'>Final Price</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { itemsArray }
        </Table.Body>
      </Table>
    );
  }


}
