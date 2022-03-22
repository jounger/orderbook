import Orderbook from "./components/OrderBook";
import SocketProvider from "./contexts/SocketProvider";

function App() {
  return (
    <div className="container">
      <SocketProvider>
        <Orderbook></Orderbook>
      </SocketProvider>
    </div>
  );
}

export default App;
