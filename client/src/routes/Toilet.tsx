import Comments from "../components/Comments";
import ToiletInfo from "../components/ToiletInfo";

const Toilet = () => {
  return (
    <>
      <div className="relative">
        <ToiletInfo />
        <Comments />
      </div>
    </>
  );
};

export default Toilet;
