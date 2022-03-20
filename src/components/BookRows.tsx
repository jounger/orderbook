import { book } from "../shared/book";

const BookRows: React.FC<{ rows: book[]; className?: string }> = (props) => {
  return (
    <div className="book__side grow">
      <div className={`book__header flex ${props.className} justify-around`}>
        <div className="text-center">Count</div>
        <div className="text-center">Total</div>
        <div className="text-center">Size</div>
        <div className="text-center">Price</div>
      </div>
      <div className="book__bars"></div>
      <div className="book__rows">{props.children}</div>
    </div>
  );
};

export default BookRows;
