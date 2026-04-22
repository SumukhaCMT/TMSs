



// import { useRef, useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { secureStorage } from "@/utils/secureStorage";
// import { toWords } from "number-to-words";
// import "./print.css";

// function PrintSevabooking() {
//   const printRef = useRef();

//   const { id } = useParams();

//   //  STATE
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");


//   //  FETCH DATA
//   useEffect(() => {
//     if (id) fetchSeva();
//   }, [id]);

//   const fetchSeva = async () => {
//     try {
//       const token = secureStorage.getItem("token");

//       const res = await axios.get(
//         `https://tmscmt.netlify.app/api/v1/temple/seva-bookings/${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setData(res.data.data);
//       console.log(res.data.data)
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Failed to load seva"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ PRINT FUNCTION
//   const handlePrint = () => {
//     const printContent = printRef.current.outerHTML;

//     const newWindow = window.open("", "", "width=900,height=700");

//     newWindow.document.write(`
//       <html>
//         <head>
//           <title>Seva Receipt</title>

//           <style>
//             body {
//               font-family: 'Segoe UI', Tahoma, sans-serif;
//               background: #f2f2f2;
//               padding: 20px;
//             }

//             .receipt {
//               max-width: 850px;
//               margin: auto;
//               background: #fff;
//               border-radius: 10px;
//               border: 1px solid #ddd;
//               padding: 25px;
//               position: relative;
//               box-shadow: 0 4px 10px rgba(0,0,0,0.1);
//             }

//             /* WATERMARK */
//             .receipt::before {
//               content: "";
//               position: absolute;
//               top: 50%;
//               left: 50%;
//               transform: translate(-50%, -50%);
//               width: 350px;
//               height: 350px;
//   background: url('${
//   data?.temple_logo
//     ? `https://tmscmt.netlify.app/public/temple/${data.temple_logo}`
//     : ""
// }') no-repeat center/contain;
//               opacity: 0.06;
//               z-index: 0;
//             }

//             .content {
//               position: relative;
//               z-index: 1;
//             }

//             /* HEADER */
//             .header {
//               display: flex;
//               align-items: center;
//               border-bottom: 2px solid #eee;
//               padding-bottom: 12px;
//             }

//             .header img {
//               width: 65px;
//               margin-right: 15px;
//             }

//             .header-text h1 {
//               margin: 0;
//               font-size: 24px;
//               color: #222;
//             }

//             .header-text p {
//               margin: 2px 0;
//               font-size: 13px;
//               color: #555;
//             }

//             /* TOP ROW */
//             .top-row {
//               display: flex;
//               justify-content: space-between;
//               margin-top: 15px;
//               font-size: 14px;
//               font-weight: 500;
//             }

//             /* MAIN */
//             .main {
//               margin-top: 25px;
//               display: flex;
//               justify-content: space-between;
//             }

//             .left p {
//               margin: 6px 0;
//               font-size: 14px;
//             }

//             .right {
//               text-align: right;
//             }

//             .amount {
//               font-size: 26px;
//               font-weight: bold;
//               color: #2e6da4;
//             }

//             /* FOOTER */
//             .footer {
//               margin-top: 40px;
//               border-top: 1px dashed #ccc;
//               padding-top: 10px;
//               text-align: right;
//               font-size: 12px;
//               color: #666;
//             }

//             /* PRINT FIX */
//             @media print {
//               body {
//                 background: none;
//               }
//               .receipt {
//                 box-shadow: none;
//                 border: 1px solid #000;
//               }
//             }
//           </style>
//         </head>

//         <body>
//           ${printContent}
//         </body>
//       </html>
//     `);

//     newWindow.document.close();

//     // wait for images to load
//     newWindow.onload = function () {
//       newWindow.focus();
//       newWindow.print();
//       newWindow.close();
//     };
//   };
//   //   //  LOADING / ERROR
//   if (loading) return <p className="text-center mt-10">Loading...</p>;
//   if (error) return <p className="text-red-500 text-center">{error}</p>;


//   return (


//     <>
//       <div className="page-center">
//         <div ref={printRef}>
//           <div className="receipt">
//             <div className="content">

//               {/* HEADER */}
//               <div className="header">

//                 <img
//                     src={
//                       data?.temple_logo
//                         ? `https://tmscmt.netlify.app/public/temple/${data.temple_logo}`
//                         : image
//                     }
//                     alt="logo"
//                   />
//                 <div className="header-text">
//                   <h1>{data?.temple_name} ®</h1>
//                   <p>{data?.temple_address}</p>
//                   <p>Ph: {data?.temple_phone} | Email: {data?.temple_email}</p>
//                 </div>
//               </div>

//               {/* TOP */}
//               <div className="top-row">
//                 <div>Receipt No: <strong>{data?.receipt_number}</strong></div>
//                 <div>Date:{" "} <strong>{new Date(data?.created_at).toLocaleDateString()}</strong></div>
//               </div>

//               {/* MAIN */}
//               <div className="main">
//                 <div className="left">
//                   <p><strong>Deity Name:</strong> {data?.deity_name}</p>
//                   <p><strong>Deity Code:</strong> {data?.deity_code}</p>
//                    <img
//                     src={
//                       data?.deity_image
//                         ? `https://tmscmt.netlify.app/public/deities/${data.deity_image}`
//                         : ""
//                     }
//                     alt="logo"
//                   />
//                   <p><strong>Seva Name:</strong> {data?.seva_name}</p>
//                   <p><strong>Devotee Name:</strong> {data?.devotee_name}</p>
//                   <p><strong>Devotee Email:</strong> {data?.devotee_email}</p>
//                   <p><strong>Phone: </strong>{data?.devotee_phone}</p>
//                   <p><strong>gender: </strong> {data?.devotee_gender}</p>
//                 </div>

//                 <div className="right">
//                   <p className="amount">₹ {data?.seva_amount}</p>

//                   <p>
//                     (Rupees{" "}
//                     {data?.seva_amount
//                       ? toWords(data.seva_amount).replace(/(^\w|\s\w)/g, m => m.toUpperCase())
//                       : ""}{" "}
//                     Only)
//                   </p>
//                 </div>
//               </div>

//               {/* FOOTER */}
//               <div className="footer">
//                 Received by: System TMS
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-center gap-4 py-10">
//         <Button type="button">
//           <Link to="/seva-booking">
//             Go Back</Link>
//         </Button>
//         <Button onClick={handlePrint} type="button">
//           Print Receipt
//         </Button>


//       </div>
//     </>
//   );
// }

// export default PrintSevabooking;



import { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toWords } from "number-to-words";
import "./print.css";

import api, { IMAGE_URLS } from "@/axios/axios";

// 🔹 Helper for images
const getImage = (type, file) => {
  return file ? IMAGE_URLS[type] + file : "";
};

function PrintSevabooking() {
  const printRef = useRef();
  const { id } = useParams();

  // STATE
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // FETCH DATA
  useEffect(() => {
    if (id) fetchSeva();
  }, [id]);

  const fetchSeva = async () => {
    try {
      const res = await api.get(`/v1/temple/seva-bookings/${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load seva");
    } finally {
      setLoading(false);
    }
  };

  // PRINT FUNCTION
  const handlePrint = () => {
    const printContent = printRef.current.outerHTML;

    const newWindow = window.open("", "", "width=900,height=700");

    newWindow.document.write(`
      <html>
        <head>
          <title>Seva Receipt</title>

          <style>
            body {
              font-family: 'Segoe UI', Tahoma, sans-serif;
              background: #f2f2f2;
              padding: 20px;
            }

            .receipt {
              max-width: 850px;
              margin: auto;
              background: #fff;
              border-radius: 10px;
              border: 1px solid #ddd;
              padding: 25px;
              position: relative;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }

            .receipt::before {
              content: "";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 350px;
              height: 350px;
              background: url('${data?.temple_logo
        ? getImage("temple", data.temple_logo)
        : ""
      }') no-repeat center/contain;
              opacity: 0.06;
              z-index: 0;
            }

            .content {
              position: relative;
              z-index: 1;
            }

            .header {
              display: flex;
              align-items: center;
              border-bottom: 2px solid #eee;
              padding-bottom: 12px;
            }

            .header img {
              width: 65px;
              margin-right: 15px;
            }

            .header-text h1 {
              margin: 0;
              font-size: 24px;
              color: #222;
            }

            .header-text p {
              margin: 2px 0;
              font-size: 13px;
              color: #555;
            }

            .top-row {
              display: flex;
              justify-content: space-between;
              margin-top: 15px;
              font-size: 14px;
              font-weight: 500;
            }

            .main {
              margin-top: 25px;
              display: flex;
              justify-content: space-between;
            }

            .left p {
              margin: 6px 0;
              font-size: 14px;
            }

            .right {
              text-align: right;
            }

            .amount {
              font-size: 26px;
              font-weight: bold;
              color: #2e6da4;
            }

            .footer {
              margin-top: 40px;
              border-top: 1px dashed #ccc;
              padding-top: 10px;
              text-align: right;
              font-size: 12px;
              color: #666;
            }

            @media print {
              body {
                background: none;
              }
              .receipt {
                box-shadow: none;
                border: 1px solid #000;
              }
            }
          </style>
        </head>

        <body>
          ${printContent}
        </body>
      </html>
    `);

    newWindow.document.close();

    newWindow.onload = function () {
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    };
  };

  // LOADING / ERROR
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <>
      <div className="page-center">
        <div ref={printRef}>
          <div className="receipt">
            <div className="content">

              {/* HEADER */}
              <div className="header">
                <img
                  src={getImage("temple", data?.temple_logo)}
                  alt="logo"
                />

                <div className="header-text">
                  <h1>{data?.temple_name} ®</h1>
                  <p>{data?.temple_address}</p>
                  <p>
                    Ph: {data?.temple_phone} | Email: {data?.temple_email}
                  </p>
                </div>
              </div>

              {/* TOP */}
              <div className="top-row">
                <div>
                  Receipt No: <strong>{data?.receipt_number}</strong>
                </div>
                <div>
                  Date:{" "}
                  <strong>
                    {new Date(data?.created_at).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* MAIN */}
              <div className="main">
                <div className="left">
                  <p><strong>Deity Name:</strong> {data?.deity_name}</p>
                  <p><strong>Deity Code:</strong> {data?.deity_code}</p>

                  <img
                    src={getImage("deities", data?.deity_image)}
                    alt="deity"
                    style={{ width: "80px", margin: "10px 0" }}
                  />

                  <p><strong>Seva Name:</strong> {data?.seva_name}</p>
                  <p><strong>Devotee Name:</strong> {data?.devotee_name}</p>
                  <p><strong>Email:</strong> {data?.devotee_email}</p>
                  <p><strong>Phone:</strong> {data?.devotee_phone}</p>
                  <p><strong>Gender:</strong> {data?.devotee_gender}</p>
                </div>

                <div className="right">
                  <p className="amount">₹ {data?.seva_amount}</p>

                  <p>
                    (Rupees{" "}
                    {data?.seva_amount
                      ? toWords(data.seva_amount).replace(
                        /(^\w|\s\w)/g,
                        (m) => m.toUpperCase()
                      )
                      : ""}{" "}
                    Only)
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="footer">
                Received by: System TMS
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-center gap-4 py-10">
        <Button asChild>
          <Link to="/seva-booking">Go Back</Link>
        </Button>

        <Button onClick={handlePrint}>
          Print Receipt
        </Button>
      </div>
    </>
  );
}

export default PrintSevabooking;