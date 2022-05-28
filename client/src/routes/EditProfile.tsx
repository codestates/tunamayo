import DrawerHeader from "../components/DrawerHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { customAxios } from "../lib/customAxios";
import { useDispatch } from "react-redux";
import { logoutHandler } from "../slices/isLoginSlice";

import Modal from "../components/Modal";

const EditProfile = () => {
  const location = useLocation();
  const queryString: string = location.search;
  const nickname: string = decodeURI(queryString.split("=")[1]);
  const [value, setValue] = useState(nickname);
  const [modal, setModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [signout, setSignout] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeNickname = async () => {
    await customAxios
      .patch("/users", { changedNickname: value })
      .then((res) => {
        if (res.status === 200) {
          setModalTitle("닉네임 변경이 완료되었습니다!");
          setModal(true);
        }
      })
      .catch((err) => {
        // 스티븐 수정함 401 => 409
        if (err.response.status === 409) {
          setModalTitle("이미 존재하는 닉네임입니다!");
          setModal(true);
        }
      });
  };

  const secessionRequest = async () => {
    await customAxios
      .delete("/users")
      .then((res) => {
        if (res.status === 200) {
          dispatch(logoutHandler());
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="relative">
      <DrawerHeader
        title="프로필수정"
        isAdmin={false}
        action={changeNickname}
      />
      <div className="flex flex-col items-center pt-8 px-[34px]">
        <div className="w-11 h-11 rounded-full shadow-search flex justify-center items-center mb-5">
          <img src="/images/main/profile-icon.svg" alt="profile-icon" />
        </div>

        <input
          onChange={(e) => setValue(e.target.value)}
          value={value}
          className="w-full h-12 py-[10px] rounded-md border border-gray20 outline-none px-3 text-center mb-2"
          type="text"
        />

        <div className="font-normal text-sm leading-[22px] text-gray20">
          닉네임을 수정해 주세요
        </div>
      </div>
      {/* 스티븐 수정함 */}
      <div
        onClick={() => {
          setModalTitle("정말 탈퇴하시겠습니까");
          setSignout(true);
        }}
        className="w-full text-center cursor-pointer font-normal text-sm leading-[22px] text-gray20"
      >
        회원탈퇴
      </div>
      {modal && (
        <Modal setModal={setModal} title={modalTitle} oneButton="확인" />
      )}
      {/* 스티븐 수정함 */}
      {signout && (
        <Modal
          setModal={setModal}
          setSignout={setSignout}
          title={modalTitle}
          left="취소"
          right="탈퇴하기"
          action={secessionRequest}
        />
      )}
    </div>
  );
};

export default EditProfile;
