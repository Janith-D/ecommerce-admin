import React, { useState, useEffect } from 'react';
import { ApiClient } from 'adminjs';
import { Box, H2, Text, FormGroup, Label, Input, Button, MessageBox } from '@adminjs/design-system';

const api = new ApiClient();

const Settings = (props) => {
  const [settings, setSettings] = useState({
    storeName: '',
    contactEmail: '',
    currency: '',
    taxRate: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Load initial settings
    api.getPage({ pageName: 'settings' })
      .then((res) => {
        if (res.data && res.data.settings) {
          setSettings(res.data.settings);
        }
      })
      .catch((err) => console.error('Failed to load settings', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // Send a POST request to update the page data
      const res = await api.request({ 
        method: 'POST', 
        url: '/pages/settings', 
        data: settings 
      });
      if (res.data && res.data.message) {
        setMessage({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error saving settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box variant="grey" padding="xl" style={{ minHeight: '100vh' }}>
      <Box mb="xl">
        <H2>Global Store Settings</H2>
        <Text>Manage key-value configuration data for your eCommerce platform.</Text>
      </Box>

      {message && (
        <MessageBox 
          mb="xl" 
          variant={message.type === 'success' ? 'success' : 'danger'}
        >
          {message.text}
        </MessageBox>
      )}

      <Box variant="white" padding="xl" shadow="card" style={{ borderRadius: '8px', maxWidth: '600px' }}>
        <form onSubmit={handleSave}>
          <FormGroup mb="lg">
            <Label>Store Name</Label>
            <Input
              name="storeName"
              value={settings.storeName || ''}
              onChange={handleChange}
              placeholder="e.g. My Awesome Shop"
              width={1}
            />
          </FormGroup>

          <FormGroup mb="lg">
            <Label>Contact Email</Label>
            <Input
              name="contactEmail"
              type="email"
              value={settings.contactEmail || ''}
              onChange={handleChange}
              placeholder="admin@mystore.com"
              width={1}
            />
          </FormGroup>

          <FormGroup mb="lg">
            <Label>Currency</Label>
            <Input
              name="currency"
              value={settings.currency || ''}
              onChange={handleChange}
              placeholder="USD, EUR, GBP..."
              width={1}
            />
          </FormGroup>

          <FormGroup mb="xl">
            <Label>Tax Rate (%)</Label>
            <Input
              name="taxRate"
              type="number"
              value={settings.taxRate || ''}
              onChange={handleChange}
              placeholder="e.g. 10"
              width={1}
            />
          </FormGroup>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Settings;