import { CheckInButton } from "patra-learn";

export const Default = () => <CheckInButton stationRef="l1/write-code" />;

export const ArticleFooterContext = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 16,
      maxWidth: 480,
      borderTop: "1px solid #e3e5df",
      paddingTop: 20,
    }}
  >
    <CheckInButton stationRef="l2/native-build" />
    <p style={{ fontSize: 12, color: "#8b929b", margin: 0 }}>
      点击切换打卡状态（存 localStorage，绿色为已学完态）
    </p>
  </div>
);
