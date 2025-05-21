import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Layout from '../components/Layout';
import { 
  getAccounts, 
  getTransactions,
  getCategories,
  getBudgets,
  formatCurrency
} from '../utils/localStorage';

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 200px)',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[2]
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1.5),
  wordBreak: 'break-word',
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.background.paper,
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[1],
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 0,
    height: 0,
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    top: '10px',
    ...(isUser
      ? {
          borderLeft: `8px solid ${theme.palette.primary.main}`,
          right: '-8px'
        }
      : {
          borderRight: `8px solid ${theme.palette.background.paper}`,
          left: '-8px'
        })
  }
}));

const AiChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant for the Money Tracker app. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "What's my current balance?",
    "How much did I spend this month?",
    "What are my top expense categories?",
    "Do I have any overdue budgets?",
    "How can I use this app?"
  ]);

  useEffect(() => {
    // Load data
    const loadData = () => {
      const accountsData = getAccounts();
      const transactionsData = getTransactions();
      const categoriesData = getCategories();
      const budgetsData = getBudgets();
      
      setAccounts(accountsData);
      setTransactions(transactionsData);
      setCategories(categoriesData);
      setBudgets(budgetsData);
    };

    loadData();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = generateAiResponse(input);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    // Focus the input field
    document.getElementById('chat-input').focus();
  };

  // Generate AI response based on user input
  const generateAiResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    // Calculate this month's expenses
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate top expense categories
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (!expensesByCategory[t.categoryId]) {
          expensesByCategory[t.categoryId] = 0;
        }
        expensesByCategory[t.categoryId] += t.amount;
      });
    
    const topCategories = Object.entries(expensesByCategory)
      .map(([categoryId, amount]) => ({
        category: categories.find(c => c.id === categoryId) || { name: 'Uncategorized' },
        amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    
    // Check for overdue budgets
    const now2 = new Date();
    const overdueBudgets = budgets.filter(budget => {
      const endDate = new Date(budget.endDate);
      return endDate < now2;
    });
    
    // Match user input to responses
    if (input.includes('balance') || input.includes('how much money') || input.includes('current balance')) {
      return `Your current total balance across all accounts is ${formatCurrency(totalBalance)}.`;
    } 
    else if (input.includes('spend this month') || input.includes('expenses this month')) {
      return `You've spent ${formatCurrency(thisMonthExpenses)} so far this month.`;
    }
    else if (input.includes('top') && input.includes('categories') || input.includes('spend most')) {
      if (topCategories.length === 0) {
        return "You don't have any expense transactions yet.";
      }
      
      return `Your top expense categories are: 
      1. ${topCategories[0]?.category.name}: ${formatCurrency(topCategories[0]?.amount)}
      ${topCategories[1] ? `2. ${topCategories[1]?.category.name}: ${formatCurrency(topCategories[1]?.amount)}` : ''}
      ${topCategories[2] ? `3. ${topCategories[2]?.category.name}: ${formatCurrency(topCategories[2]?.amount)}` : ''}`;
    }
    else if (input.includes('overdue') && input.includes('budget')) {
      if (overdueBudgets.length === 0) {
        return "You don't have any overdue budgets.";
      }
      
      return `You have ${overdueBudgets.length} overdue budget(s): ${overdueBudgets.map(b => b.name).join(', ')}.`;
    }
    else if (input.includes('how') && input.includes('use') || input.includes('help')) {
      return `Here's how to use the Money Tracker app:
      
      1. Start by adding your accounts in the Accounts page
      2. Track your income and expenses in the Transactions page
      3. Create categories to organize your transactions
      4. Set up budgets to manage your spending
      5. Use the Shopping List to plan future purchases
      6. Check the Reports page for insights on your finances
      
      You can customize the app in the Profile page, including changing the theme and currency.`;
    }
    else if (input.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    else if (input.includes('hello') || input.includes('hi')) {
      return "Hello! How can I assist you with your finances today?";
    }
    else {
      return "I'm not sure I understand. Could you rephrase your question? You can ask me about your balance, expenses, budgets, or how to use the app.";
    }
  };

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          AI Assistant
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <ChatContainer sx={{ flex: 1 }}>
            <MessagesContainer>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  {!message.isUser && (
                    <Avatar 
                      sx={{ 
                        mr: 1, 
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32
                      }}
                    >
                      <SmartToyIcon fontSize="small" />
                    </Avatar>
                  )}
                  
                  <MessageBubble isUser={message.isUser}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {message.text}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        textAlign: message.isUser ? 'right' : 'left',
                        mt: 0.5,
                        opacity: 0.7
                      }}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </MessageBubble>
                  
                  {message.isUser && (
                    <Avatar 
                      sx={{ 
                        ml: 1, 
                        bgcolor: 'secondary.main',
                        width: 32,
                        height: 32
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  )}
                </Box>
              ))}
              
              {isTyping && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    mb: 2
                  }}
                >
                  <Avatar 
                    sx={{ 
                      mr: 1, 
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32
                    }}
                  >
                    <SmartToyIcon fontSize="small" />
                  </Avatar>
                  
                  <MessageBubble isUser={false} sx={{ px: 3 }}>
                    <Typography variant="body2">
                      Typing
                      <span className="typing-animation">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </Typography>
                  </MessageBubble>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </MessagesContainer>
            
            <InputContainer>
              <TextField
                id="chat-input"
                fullWidth
                placeholder="Type your message here..."
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        color="primary" 
                        onClick={handleSendMessage}
                        disabled={!input.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </InputContainer>
          </ChatContainer>
          
          <Box sx={{ width: { xs: '100%', md: 300 } }}>
            <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <HelpOutlineIcon sx={{ mr: 1 }} />
                  Suggested Questions
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {suggestedQuestions.map((question, index) => (
                    <Chip
                      key={index}
                      label={question}
                      onClick={() => handleSuggestedQuestion(question)}
                      clickable
                      color="primary"
                      variant="outlined"
                      sx={{ justifyContent: 'flex-start' }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
            
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About AI Assistant
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="body2" paragraph>
                  The AI Assistant can help you with:
                </Typography>
                
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemText primary="• Checking your account balances" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="• Summarizing your spending" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="• Providing insights on your finances" />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="• Explaining how to use the app" />
                  </ListItem>
                </List>
                
                <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                  Note: This is a simple AI assistant that works with your local data.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default AiChat;
