import "./App.css";
import Orderbook from "./components/OrderBook";
import SocketProvider from "./contexts/SocketProvider";

function App() {
  return (
    <div className="App container mx-auto">
      <SocketProvider>
        <Orderbook></Orderbook>
      </SocketProvider>
    </div>
  );
}

export default App;
