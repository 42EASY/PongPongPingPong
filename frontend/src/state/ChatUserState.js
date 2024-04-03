export const chatUserState = (() => {
    let state = {
        userStatus: {}, // 사용자 상태 저장
    };

    return {
        getUserState: () => state.userStatus,
        addUserState: (userId, { isOnline, isBlocked }) => {
            state.userStatus[userId] = { isOnline, isBlocked };
        },
        setUserState: (userId, { isOnline, isBlocked }) => {
            // 사용자가 state.userStatus에 존재하는지 확인
            if (state.userStatus[userId]) {
                // isOnline과 isBlocked 값이 주어진 경우에만 업데이트
                if (isOnline !== undefined) {
                    state.userStatus[userId].isOnline = isOnline;
                }
                if (isBlocked !== undefined) {
                    state.userStatus[userId].isBlocked = isBlocked;
                }
            }
        },
    };
})();
