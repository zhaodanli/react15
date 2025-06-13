import useAnimation from './../hooks/useAnimation';
import './Circle.css';

function Circle() {
  const [className, start] = useAnimation('circle','active');
    return (
      <div className={className} onClick={start}></div>
    );
}
export default Circle;;