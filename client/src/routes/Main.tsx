import { Map, MapMarker, MarkerClusterer } from "react-kakao-maps-sdk";
import { useEffect, useState } from "react";
import ModalPopUp from "../components/ModalPopUp";
import { customAxios } from "../lib/customAxios";
import { IUser } from "../types/user";
import { IComment, CommentInfoProps } from "../types/comment";
import { ToiletInfoProps } from "../types/toilet";
import SearchBar from "../components/SearchBar";
import CurrentLocationButton from "../components/CurrentLocationButton";
import NavButton from "../components/NavButton";
import Drawer from "../components/Drawer";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { useAllToiletsQuery } from "../api/toilet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { offSplash } from "../slices/splashSlice";
import { ModalPopUpState } from "../types/common";

const Main = () => {
  // useEffect(() => {
  //   setTimeout(() => {
  //     dispatch(offSplash());
  //   }, 3000);
  // }, []);
  const modal = useSelector<RootState>((state) => state.modal.value);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const splash = useSelector<RootState>((state) => state.splash.value);
  const [center, setCenter] = useState({
    center: {
      lat: 37.5697,
      lng: 126.982,
    },
    isAllow: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const [modalPopUp, setModalPopUp] = useState<ModalPopUpState>("hidden");
  const [create, setCreate] = useState(false);
  const [currentArea, setCurrentArea] = useState({
    sw: { lat: 0, lng: 0 },
    ne: { lat: 0, lng: 0 },
  });
  const [currentPositions, setCurrentPositions] = useState<any[]>([]);
  const [toiletInfo, setToiletInfo] = useState<ToiletInfoProps>({
    title: "",
    roadName: "",
    id: 0,
  });
  const [commentInfo, setCommentInfo] = useState<CommentInfoProps>({
    length: 0,
    avg: 0,
  });
  const [drawer, setDrawer] = useState<boolean>(false);
  const [drawerClose, setDrawerClose] = useState<boolean>(false);
  const drawerAction = () => {
    setDrawerClose(true);
    setTimeout(() => {
      setDrawer(false);
      setDrawerClose(false);
    }, 500);
  };

  const overlayClass = () => {
    if (drawerClose)
      return "animate-overlayHide absolute top-0 bg-black opacity-40 w-full h-[100vh] z-40";
    else return "absolute top-0 bg-black opacity-40 w-full h-[100vh] z-40";
  };

  const commentRequest = async (toiletId: number) => {
    const request = await customAxios.get(`/toilets/${toiletId}/comments`);
    const { commentList } = request.data;
    const length = commentList.length;
    const ratingList = commentList.map((comment: IComment) => comment.rating);
    const sum = ratingList.reduce((prev: number, curr: number) => {
      return prev + curr;
    }, 0);
    const avg = Math.round((sum / length) * 10) / 10;
    if (isNaN(sum) || isNaN(avg)) setCommentInfo({ length: 0, avg: 0 });
    else setCommentInfo({ length, avg });
  };

  const allToilets = useAllToiletsQuery();

  useEffect(() => {
    customAxios.get("/users").then((res) => setUserInfo(res.data.userInfo));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter((prev) => ({
            ...prev,
            center: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            isAllow: true,
          }));
          setIsLoading(false);
        },
        (err) => {
          setIsLoading(false);
          console.log(err);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  const changeCurrentArea = (map: any) => {
    setCurrentArea({
      sw: {
        lat: map.getBounds().getSouthWest().getLat(),
        lng: map.getBounds().getSouthWest().getLng(),
      },
      ne: {
        lat: map.getBounds().getNorthEast().getLat(),
        lng: map.getBounds().getNorthEast().getLng(),
      },
    });
  };

  const includePositions = () => {
    if (allToilets.data) {
      const newPositions = [...allToilets.data].filter((m) => {
        return (
          m.latlng.lat >= currentArea.sw.lat &&
          m.latlng.lat < currentArea.ne.lat &&
          m.latlng.lng >= currentArea.sw.lng &&
          m.latlng.lng < currentArea.ne.lng
        );
      });
      setCurrentPositions(newPositions);
    }
  };

  useEffect(() => {
    includePositions();
  }, [currentArea, allToilets.data, center]);

  return (
    <>
      {splash ? (
        <div className="animate-splashOn bg-tnBlueLight h-[100vh] flex flex-col justify-center items-center">
          <img
            className="w-[194px] h-[233px] mb-[160px] animate-bounce"
            src="/images/common/logo.png"
            alt="logo"
          />
          <img
            className="w-[194px] h-[70px]"
            src="/images/common/typo-logo.svg"
            alt="typo-logo"
          />
        </div>
      ) : (
        <div className="relative">
          <>
            {drawer ? (
              <div
                onClick={() => drawerAction()}
                className={overlayClass()}
              ></div>
            ) : null}

            <Map
              center={center.center}
              className="w-full h-[100vh] z-0"
              level={2}
              maxLevel={4}
              onCreate={(map) => {
                if (!create) {
                  changeCurrentArea(map);
                }
                setCreate(true);
              }}
              onTileLoaded={(map) => {
                changeCurrentArea(map);
              }}
              onZoomChanged={(map) => {
                changeCurrentArea(map);
              }}
              onDragEnd={(map) => {
                changeCurrentArea(map);
              }}
              onClick={() => {
                setModalPopUp("pop-down");
                setTimeout(() => {
                  setModalPopUp("hidden");
                }, 1000);
              }}
            >
              <SearchBar data={allToilets.data} setCenter={setCenter} />
              <NavButton setDrawer={setDrawer} />
              <CurrentLocationButton setCenter={setCenter} />
              {isLoading ? (
                <Loading content="현재 위치 불러 오는 중" />
              ) : (
                <MarkerClusterer averageCenter={true} minLevel={4}>
                  {currentPositions.map((position, index) => (
                    <MapMarker
                      key={position.id}
                      position={position.latlng}
                      onClick={() => {
                        setModalPopUp("pop-up");
                        setToiletInfo(position);
                        commentRequest(position.id);
                      }}
                      image={{
                        src: "/images/main/marker-icon.png",
                        size: { width: 24, height: 32 },
                      }}
                    />
                  ))}
                </MarkerClusterer>
              )}
              {center.isAllow && (
                <MapMarker
                  key="current-location"
                  position={center.center}
                  image={{
                    src: "/images/main/current-marker.png",
                    size: { width: 48, height: 57.78 },
                  }}
                />
              )}

              <ModalPopUp
                modalPopUp={modalPopUp}
                commentInfo={commentInfo}
                toiletInfo={toiletInfo}
              />
            </Map>
            {modal && (
              <Modal
                title="로그인이 필요합니다."
                left="취소"
                right="로그인"
                action={() => navigate("/login")}
              />
            )}
            <Drawer
              drawer={drawer}
              drawerClose={drawerClose}
              userInfo={userInfo}
            />
          </>
        </div>
      )}
    </>
  );
};

export default Main;
