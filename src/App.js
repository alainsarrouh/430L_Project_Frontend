import './App.css';
import UserCredentialsDialog from './UserCredentialsDialog/UserCredentialsDialog';
import AddFundsDialog from './AddFundsDialog/AddFundsDialog';
import TradeDialog from './TradeDialog/TradeDialog';
import RequestsDialog from './RequestsDialog/RequestsDialog'
import { getUserToken, saveUserToken, clearUserToken } from "./localStorage";
import { useState, useEffect, useCallback, useRef } from "react";
import {AppBar, Toolbar, Button, Typography, Snackbar, Alert, TextField, RadioGroup, Radio, FormControlLabel, Select, MenuItem} from '@mui/material'
import {DataGrid} from '@mui/x-data-grid';
import {Line} from 'react-chartjs-2';
import {Chart, registerables } from 'chart.js'; 
var SERVER_URL = "http://127.0.0.1:5000";

function App() {
    let [buyUsdRate, setBuyUsdRate] = useState(null);
    let [sellUsdRate, setSellUsdRate] = useState(null);

    let [calculatorInput, setCalculatorInput] = useState(0);
    let [calculatorResult, setCalculatorResult] = useState(0);
    let [calculatorTransactionType, setCalculatorTransactionType] = useState("lbp_to_usd");

    let [lbpInput, setLbpInput] = useState("");
    let [usdInput, setUsdInput] = useState("");
    let [transactionType, setTransactionType] = useState("usd-to-lbp");

    let [userToken, setUserToken] = useState(getUserToken());
    let [userTransactions, setUserTransactions] = useState([]);

    let [usdUserWallet, setUsdUserWallet] = useState(0);
    let [lbpUserWallet, setLbpUserWallet] = useState(0);

    const States = {
        PENDING: "PENDING",
        USER_CREATION: "USER_CREATION",
        USER_LOG_IN: "USER_LOG_IN",
        USER_AUTHENTICATED: "USER_AUTHENTICATED"
    }
    let [authState, setAuthState] = useState(States.PENDING);
    let [addFundsState, setAddFundsState] = useState(false);
    let [tradeState, setTradeState] = useState(false);
    let [requestsState, setRequestsState] = useState(false);

    const graph = useRef(null);
    
    const columns = [
        {field: 'usd_amount', headerName: 'USD Amount', width: 150},
        {field: 'lbp_amount', headerName: 'LBP Amount', width: 150},
        {field: 'usd_to_lbp', headerName: 'USD To LBP?', width: 150},
        {field: 'added_date', headerName: 'Date Added', width: 250}
    ]

    Chart.register(...registerables)

    function getChartData(){
        fetch(`${SERVER_URL}/transactions`,
            {
                method: 'GET',
                headers: {
                        'Content-Type': 'application/json'
                    }
            })
        .then(response => response.json())
        .then(data => {
            if (graph.current){
                graph.current.data.labels = data["dates"];
                graph.current.data.datasets[0].data = data["usdToLbpAverageByDate"]
                graph.current.data.datasets[1].data = data["lbpToUsdAveragesByDate"]
                graph.current.data.datasets[0].backgroundColor ='rgba(0,0,1700)';
                graph.current.data.datasets[1].backgroundColor ='rgba(220,0,0)';
                graph.current.update();
            }
        });
    }

    function fetchRates(){
        fetch(`${SERVER_URL}/exchangeRate`)
        .then(response => response.json())
        .then(data => {
            setSellUsdRate(parseFloat(data['usd_to_lbp']).toFixed(2));
            setBuyUsdRate(parseFloat(data['lbp_to_usd']).toFixed(2));
        });
    }
    useEffect(fetchRates, []);

    function getFunds(){
        fetch(
            `${SERVER_URL}/wallet`, 
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": "Bearer "+userToken,
                },
            })
            .then((response) => response.json())
            .then((wallet) => {
                setUsdUserWallet(wallet["usd_funds"]);
                setLbpUserWallet(wallet["lbp_funds"]);
            });
    }

    useEffect( () =>{
        getFunds()
    }, [userToken]);

    const fetchUserTransactions = useCallback(() => {
        fetch(
            `${SERVER_URL}/transaction`, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
            })
            .then((response) => response.json())
            .then((transactions) => setUserTransactions(transactions));
        }, [userToken]);

    useEffect(() => {
        if (userToken) {
            fetchUserTransactions();
        }
    }, [fetchUserTransactions, userToken]);

    function addItem(){
        var lbp = lbpInput;
        var usd = usdInput;

        const data = {
            usd_amount : usd, 
        usd_amount : usd, 
            usd_amount : usd, 
        usd_amount : usd, 
            usd_amount : usd, 
            lbp_amount : lbp, 
        lbp_amount : lbp, 
            lbp_amount : lbp, 
        lbp_amount : lbp, 
            lbp_amount : lbp, 
            usd_to_lbp : (transactionType == "usd-to-lbp")
        };

        var headers;
        if (userToken == null){
            headers =  {
                'Content-Type': 'application/json'
            };
        }
        else{
            headers =  {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + userToken
            };
        }

        fetch(`${SERVER_URL}/transaction`,
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data),
                }
            )
            .then(response => response.json())
            .then(data => {
                fetchRates();
                setLbpInput("");
                setUsdInput("");
                setTransactionType("usd-to-lbp");
                }
            );
    }

    function addFunds(addedAmount, isUsd){
        fetch(`${SERVER_URL}/wallet`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userToken
                    },
                    body: JSON.stringify({"amount_added": addedAmount, "is_usd": isUsd}),
                }
            )
            .then(response => response.json())
            .then(data => {
                    setAddFundsState(false);
                    getFunds();
                }
            );
    }

    function trade(buyAmount, sellAmount, otherUserId, tradeType){
        var body;
        if (tradeType){
            body = {
                "usd_amount": sellAmount,
                "lbp_amount": buyAmount,
                "usd_to_lbp": tradeType,
                "other_user_id": otherUserId
            };
        }
        else{
            body = {
                "usd_amount": buyAmount,
                "lbp_amount": sellAmount,
                "usd_to_lbp": tradeType,
                "other_user_id": otherUserId
            }
        }
        fetch(`${SERVER_URL}/request`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + userToken
                    },
                    body: JSON.stringify(body),
                }
            )
            .then(response => response.json())
            .then(data => {
                    setTradeState(false);
                }
            );
    }

    function calculate(){
        if (calculatorTransactionType == "usd_to_lbp"){
            if (sellUsdRate != null){
                setCalculatorResult((calculatorInput*sellUsdRate).toFixed(2));
            }
            }
            else{
            if (buyUsdRate != null){
                setCalculatorResult((calculatorInput/buyUsdRate).toFixed(2));
            }
        }
    }

    function login(username, password) {
        return fetch(
            `${SERVER_URL}/authentication`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_name: username,
                    password: password,
                }),
            })
            .then((response) => response.json())
            .then((body) => {
                setAuthState(States.USER_AUTHENTICATED);
                setUserToken(body.token);
                saveUserToken(body.token)
            }
        );
    }

    function createUser(username, password) {
        return fetch(
            `${SERVER_URL}/user`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_name: username,
                    password: password,
                }),
            })
            .then((response) => login(username, password));
    }

    function logout(){
        setUserToken(null);
        clearUserToken()
    }

    return (
    <div>
        <AppBar position="static">
            <Toolbar classes={{root:"nav"}}>
            
                <Typography variant="h5">LBP Exchange Tracker</Typography>
                <div>
                    {
                        userToken !== null ? (
                            <div>
                                <Typography variant="h7">Wallet: </Typography>
                                <Typography variant="h7" color={'rgba(0,0,1700)'}>USD: {usdUserWallet} </Typography>
                                <Typography variant="h7" color={'rgba(220,0,0)'}>LBP: {lbpUserWallet} </Typography>
                                <Button color="inherit" onClick={() => setRequestsState(true)}> Requests </Button>
                                <Button color="inherit" onClick={() => setTradeState(true)}> Trade </Button>
                                <Button color="inherit" onClick={() => setAddFundsState(true)}> Buy </Button>
                                <Button color="inherit" onClick={logout}> Logout </Button>
                            </div>
                        ) : (
                            <div>
                                <Button color="inherit" onClick={() => setAuthState(States.USER_CREATION)}>Register</Button>
                                <Button color="inherit" onClick ={() => setAuthState(States.USER_LOG_IN)}>Login</Button>
                            </div>
                        )
                    }
                </div>
            </Toolbar>
        </AppBar>
        <div className="wrapper">
            <Typography variant="h4">Today's Exchange Rate</Typography>
            <p>LBP to USD Exchange Rate</p>
            <Typography variant="h6">Buy USD: <span id="buy-usd-rate">{buyUsdRate}</span></Typography>
            <Typography variant="h6">Sell USD: <span id="sell-usd-rate">{sellUsdRate}</span></Typography>

            <hr />

            <Typography variant="h5">Rate Calculator</Typography>
            <div className="radio-group">
                <RadioGroup value={calculatorTransactionType} onChange={(_, value) => setCalculatorTransactionType(value)}>
                    <FormControlLabel value="lbp_to_usd" control={<Radio />} label="LBP to USD"/>
                    <FormControlLabel value="usd_to_lbp" control={<Radio />} label="USD to LBP"/>
                </RadioGroup>
            </div>
            <div className="form-item">
                <TextField fullWidth label="Input Value" type="number" value={calculatorInput} 
                    onChange={({ target: { value } }) => setCalculatorInput(value)}
                />
            </div>
            <div className="form-item">
                <TextField fullWidth label="Output Value" type="number" disabled = {true} value={calculatorResult}
                />
            </div>
            <Button color="primary" variant="contained" onClick={() => calculate()} >
                    Calculate
            </Button>
        </div>
        <div className='wrapper'>
            <Line data={{
                labels: [], 
                backgroundColor: [
                    'rgba(0,170,0)',
                    'rgba(170,0,0)'
                ],
                datasets: [{
                    label: 'USD to LBP Exchange Rates over time', 
                    data: []
                },{
                    label: 'LBP to USD Exchange Rates over time', 
                    data: []
                }
            ]
            }
            } ref={graph}/>
            {getChartData()}
        </div>
        <div className="wrapper">
            <Typography variant="h5">Record a recent transaction</Typography>
            <form name="transaction-entry">
                <div className="form-item">
                    <TextField fullWidth label="LBP Amount" id="lbp-amount" type="number" value={lbpInput} 
                        onChange={e => setLbpInput(e.target.value)}
                    />
                </div>
                <div className="form-item">
                    <TextField fullWidth label="USD Amount" id="usd-amount" type="number" value={usdInput} 
                        onChange={e => setUsdInput(e.target.value)}
                    />
                </div>
                <Select id="transaction-type" value={transactionType} onChange={e => setTransactionType(e.target.value)}>
                    <MenuItem value="usd-to-lbp">USD to LBP</MenuItem>
                    <MenuItem value="lbp-to-usd">LBP to USD</MenuItem>
                </Select>
                <Button color="primary" variant="contained" id="add-button" onClick={addItem}>
                    Add
                </Button>
            </form>
        </div>
        {userToken && (
            <div className="wrapper">
                <Typography variant="h5">Your Transactions</Typography>
                <DataGrid
                    rows={userTransactions}
                    columns={columns}
                    autoHeight
                />
            </div>
        )}
        <UserCredentialsDialog
            open = {authState==States.USER_CREATION} onSubmit={createUser} 
            onClose={() => setAuthState(States.USER_AUTHENTICATED)} title="Register" submitText="Submit" 
        />
        <UserCredentialsDialog
            open = {authState==States.USER_LOG_IN} onSubmit={login} 
            onClose={() => setAuthState(States.USER_AUTHENTICATED)} title="Login" submitText="Submit" 
        />
        <AddFundsDialog
            open = {addFundsState==true} onSubmit={addFunds} 
            onClose={() => setAddFundsState(false)}
        />
        <TradeDialog
            open = {tradeState==true} onSubmit={trade} 
            onClose={() => setTradeState(false)} userToken = {userToken}
        />
        <RequestsDialog
            open = {requestsState==true} onSubmit={()=>getFunds()} 
            onClose={() => {setRequestsState(false);getFunds();}} userToken = {userToken}
        />
        <Snackbar elevation={6} variant="filled" open={authState === States.USER_AUTHENTICATED}
            autoHideDuration={2000} onClose={() => setAuthState(States.PENDING)} >
            <Alert severity="success">Success</Alert>
        </Snackbar>
        <script src="script.js"></script>
    </div>
    );
}

export default App;
