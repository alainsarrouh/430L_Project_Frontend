import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import React, { useState } from "react";
import {RadioGroup, Radio, FormControlLabel, Typography} from '@mui/material'
import {DataGrid, GridColDef, GridValueGetterParams} from '@mui/x-data-grid'
import {useEffect} from "react";
import "./RequestsDialog.css";
var SERVER_URL = "http://127.0.0.1:5000";

export default function AddFundsDialog({open, onSubmit, onClose, userToken}) {
    let [tableData, setTableData] = useState([]);

    function fetchTableData(){
        fetch(
            `${SERVER_URL}/request`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${userToken}`,
                },
            })
            .then((response) => response.json())
            .then((data) => {
                var L = [];
                data.map(entry =>{
                    if(entry["usd_to_lbp"]){
                        L.push({
                            "request_id": entry["id"],
                            "amount_to_give": entry["lbp_amount"], 
                            "amount_to_receive": entry["usd_amount"], 
                            "usd_to_lbp": entry["usd_to_lbp"]? "No": "Yes", 
                            "requested_by": entry["user_id"]
                        });
                    }
                    else{
                        L.push({
                            "request_id": entry["id"],
                            "amount_to_give": entry["usd_amount"], 
                            "amount_to_receive": entry["lbp_amount"], 
                            "usd_to_lbp": entry["usd_to_lbp"]? "No": "Yes", 
                            "requested_by": entry["user_id"]
                        });
                    }
                });
                setTableData(L);
            }
        );
    }
    useEffect(() => {
        fetchTableData();
    }, [userToken]);

    function deleteRequest(request_id){
        fetch(`${SERVER_URL}/request`,
                {
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({"id": request_id}),
                }
            )
            .then(response => response.json())
            .then(data => {
                fetchTableData();
                }
            );
    }

    function acceptRequest(request_id){
        fetch(`${SERVER_URL}/trade`,
                {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `bearer ${userToken}`,
                    },
                    body: JSON.stringify({"id": request_id}),
                }
            )
            .then(response => response.json())
            .then(data => {
                fetchTableData();
                }
            );
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <div className="dialog-container">
            <DialogTitle>Requests</DialogTitle>
            <table>
                <tbody>
                <tr>
                    <th>Amount To Give</th>
                    <th>Amount To Receive</th>
                    <th>USD to LBP?</th>
                    <th>Requested By</th>
                    <th>Accept or Decline</th>
                </tr>
                </tbody>
                {
                    tableData.map(x=>(
                        <tbody>
                            <tr>
                                <th>{x["amount_to_give"]}</th>
                                <th>{x["amount_to_receive"]}</th>
                                <th>{x["usd_to_lbp"]}</th>
                                <th>{x["requested_by"]}</th>
                                <th>
                                <Button color="success" variant="contained" onClick={()=>acceptRequest(x["request_id"])}>
                                    Accept
                                </Button>
                                <Button color="error" variant="contained" onClick={()=>deleteRequest(x["request_id"])}>
                                    Decline
                                </Button>
                                </th>
                            </tr>
                        </tbody>
                    )
                    )
                }
            </table>
            </div>
        </Dialog>
    );
}