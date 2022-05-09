import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import React, { useState } from "react";
import {RadioGroup, Radio, FormControlLabel} from '@mui/material'
import "./AddFundsDialog.css";

// Component that presents a dialog to collect credentials from the user
export default function AddFundsDialog({open, onSubmit, onClose,}) {
    let [addedFunds, setAddedFunds] = useState(0);
    let [isUsd, setIsUsd] = useState(false);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <div className="dialog-container">
                <DialogTitle>Add Funds</DialogTitle>
                <div className="form-item">
                    <TextField fullWidth label="Amount" type="number" value={addedFunds} 
                        onChange={({ target: { value } }) => setAddedFunds(value)}
                    />
                </div>
                <div className="form-item">
                    <RadioGroup value={isUsd} onChange={(_, value) => setIsUsd(value)}>
                        <FormControlLabel value="usd" control={<Radio />} label="USD"/>
                        <FormControlLabel value="lbp" control={<Radio />} label="LBP"/>
                    </RadioGroup>
                </div>
                <Button color="primary" variant="contained" onClick={() => onSubmit(addedFunds, isUsd=="usd")} >
                    Add
                </Button>
            </div>
        </Dialog>
    );
}