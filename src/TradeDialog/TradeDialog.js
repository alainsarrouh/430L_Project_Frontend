import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import React, { useState } from "react";
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import {RadioGroup, Radio, FormControlLabel} from '@mui/material'
import {useEffect} from "react";
import "./TradeDialog.css";
var SERVER_URL = "http://127.0.0.1:5000";

// Component that presents a dialog to collect credentials from the user
export default function TradeDialog({open, onSubmit, onClose, userToken}) {
    let [buyAmount, setBuyAmount] = useState(0);
    let [sellAmount, setSellAmount] = useState(0);
    let [otherUserId, setOtherUserId] = useState(0);
    let [usdToLbp, setUsdToLbp] = useState("lbp_to_usd");
    let [users, setUsers] = useState([]);
    
    useEffect(() => {
        fetch(
            `${SERVER_URL}/users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `bearer ${userToken}`,
                },
            })
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
                setOtherUserId(data[0].id)
            }
        );
    }, [userToken]);
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <div className="dialog-container">
                <DialogTitle>Send A Trade Request</DialogTitle>
                <div className="form-item">
                    <TextField fullWidth label="Amount To Give" type="number" value={sellAmount} 
                        onChange={({ target: { value } }) => setSellAmount(value)}
                    />
                </div>
                <div className="form-item">
                    <TextField fullWidth label="Amount To Receive" type="number" value={buyAmount} 
                        onChange={({ target: { value } }) => setBuyAmount(value)}
                    />
                </div>
                <div className="form-item">
                    <RadioGroup value={usdToLbp} onChange={(_, value) => setUsdToLbp(value)}>
                        <FormControlLabel value="lbp_to_usd" control={<Radio />} label="LBP to USD"/>
                        <FormControlLabel value="usd_to_lbp" control={<Radio />} label="USD to LBP"/>
                    </RadioGroup>
                </div>
                <div className="form-item">
                    <Select id="other_user" value={otherUserId} onChange={e => setOtherUserId(e.target.value)}>
                    {users.map((user) => (
                        <MenuItem value={user.id}>{user.user_name}</MenuItem>
                    ))}
                    </Select>
                </div>
                <Button color="primary" variant="contained" onClick={() => onSubmit(buyAmount, sellAmount, otherUserId, usdToLbp == "usd_to_lbp")} >
                    Request Trade
                </Button>
            </div>
        </Dialog>
    );
}