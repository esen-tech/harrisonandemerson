import Card from 'react-bootstrap/Card'

// https://getbootstrap.com/docs/5.2/helpers/stretched-link/

const ClickableCard = ({ children, onClick, ...rest }) => (
  <Card {...rest}>
    {children}
    <a href="#" className="stretched-link" onClick={onClick} />
  </Card>
)

export default ClickableCard
