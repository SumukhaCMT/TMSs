
import { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toWords } from "number-to-words";

import "./tokens.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import api, { IMAGE_URLS } from "@/axios/axios";

// 🔹 Helper for images
const getImage = (type, file) => {
  return file ? IMAGE_URLS[type] + file : "";
};

function PrintTokens() {
  const printRef = useRef();

  const { id } = useParams();

  // STATE
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PRINT STATES
  const [open, setOpen] = useState(false);
  const [copies, setCopies] = useState(1);

  // FETCH DATA
  useEffect(() => {
    if (id) fetchToken();
  }, [id]);

  const fetchToken = async () => {
    try {
      const res = await api.get(`/v1/temple/tokens/${id}`);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load token");
    } finally {
      setLoading(false);
    }
  };

  // PRINT FUNCTION
  const handlePrint = () => {
    const count = copies && copies > 0 ? copies : 1;

    let allCopiesHTML = "";

    for (let i = 0; i < count; i++) {
      allCopiesHTML += `
        <div style="page-break-after: always;">
          <div style="text-align:right;font-size:12px;">Copy ${i + 1}</div>
          ${printRef.current.outerHTML}
        </div>
      `;
    }

    const newWindow = window.open("", "", "width=900,height=700");

    newWindow.document.write(`
      <html>
        <head>
          <title>Token Receipt</title>

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
              page-break-inside: avoid;
            }

            .receipt::before {
              content: "";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 350px;
              height: 350px;
              background: url('${
                data?.temple_logo
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
            }

            .header-text p {
              margin: 2px 0;
              font-size: 13px;
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
          ${allCopiesHTML}
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
                <div>Token Id: <strong>{data?.id}</strong></div>
                <div>Token Code: <strong>{data?.token_code}</strong></div>
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
                  <p><strong>Seva:</strong> {data?.seva_name}</p>
                  <p><strong>Deity:</strong> {data?.deity_name}</p>
                  <p><strong>Deity Code:</strong> {data?.deity_code}</p>

                  <img
                    src={getImage("deities", data?.deity_image)}
                    alt="deity"
                    style={{ width: "80px", margin: "10px 0" }}
                  />
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
                Token Received by: System TMS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-center gap-4 py-10">
        <Button asChild>
          <Link to="/tokens">Go Back</Link>
        </Button>

        {/* <Button onClick={() => setOpen(true)}>
          Print Token Receipt
        </Button> */}
         <Button
              onClick={async () => {
                try {
                  await api.post("/v1/temple/tokens/token-issues", {
                    
                     token_id: data.id,
                    seva_id: data.seva_id,
                    deity_id: data.deity_id,
                    seva_amount: data.seva_amount,
                    seva_name: data.seva_name,
                     quantity: copies && copies > 0 ? copies : 1,
                  });

                  setOpen(false);
                  handlePrint();
                } catch (err) {
                  console.error("Token issue failed", err);
                }
              }}
            >
              Print
            </Button>
        <Button onClick={() => setOpen(true)}>
          Print Token multiple Receipt
        </Button>
      </div>

      {/* PRINT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Copies</DialogTitle>
            <DialogDescription>
              Enter number of copies
            </DialogDescription>
          </DialogHeader>

          <Input
            type="number"
            min={1}
            value={copies}
            onChange={(e) => setCopies(Number(e.target.value))}
          />
          <Input
            type="text"
            name="remark"
            value={data.remark || ""}
            placeholder="Enter the remark"
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                remark: e.target.value,
              }))
            }
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button
              onClick={async () => {
                try {
                  await api.post("/v1/temple/tokens/token-issues", {
                    
                     token_id: data.id,
                    seva_id: data.seva_id,
                    deity_id: data.deity_id,
                    seva_amount: data.seva_amount,
                    seva_name: data.seva_name,
                     quantity: copies && copies > 0 ? copies : 1,
                      remark: data.remark || "",
                  });

                  setOpen(false);
                  handlePrint();
                } catch (err) {
                  console.error("Token issue failed", err);
                }
              }}
            >
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PrintTokens;