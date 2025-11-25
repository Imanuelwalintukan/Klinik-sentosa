import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Phone, MapPin, Calendar, Save, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCustomerProfile, updateCustomerProfile } from '../services/api';
import { CustomerProfile as CustomerProfileType } from '../types';

export const CustomerProfile: React.FC = () => {
    const [profile, setProfile] = useState<CustomerProfileType | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await getCustomerProfile();
            setProfile(response.data.data);
            if (response.data.data) {
                setFormData({
                    name: response.data.data.patient.name || '',
                    phone: response.data.data.patient.phone || '',
                    address: response.data.data.patient.address || '',
                });
            }
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateCustomerProfile(formData);
            toast.success('Profile updated successfully');
            setEditing(false);
            fetchProfile();
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.patient.name || '',
                phone: profile.patient.phone || '',
                address: profile.patient.address || '',
            });
        }
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main mx-auto mb-4"></div>
                    <p className="text-text-white">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-6">
                <Card className="p-12 text-center">
                    <User className="h-24 w-24 text-text-muted mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold text-text-white mb-2">Profile Not Found</h2>
                    <p className="text-text-muted">Unable to load your profile information.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-white">My Profile</h1>
                {!editing && (
                    <Button onClick={() => setEditing(true)} variant="primary">
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="p-6 lg:col-span-1">
                    <div className="text-center">
                        <div className="bg-gradient-to-br from-primary-main to-primary-light rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <User className="h-16 w-16 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-text-white mb-1">{profile.patient.name}</h2>
                        <p className="text-text-muted mb-4">{profile.user.email}</p>
                        <div className="inline-block bg-primary-main/20 text-primary-light px-4 py-2 rounded-full text-sm font-semibold">
                            Patient ID: {profile.patient.id}
                        </div>
                    </div>
                </Card>

                {/* Details Card */}
                <Card className="p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold text-text-white mb-6">Personal Information</h3>

                    {editing ? (
                        <div className="space-y-4">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                icon={User}
                                required
                            />

                            <Input
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                icon={Phone}
                                placeholder="+62 xxx xxxx xxxx"
                            />

                            <div>
                                <label className="block text-sm font-medium text-text-default mb-2">
                                    <MapPin className="inline h-4 w-4 mr-2" />
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-bg-dark border border-white/10 rounded-lg text-text-white focus:outline-none focus:ring-2 focus:ring-primary-main"
                                    placeholder="Enter your address"
                                />
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    variant="primary"
                                    className="flex-1"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    disabled={saving}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <User className="h-5 w-5 text-primary-main mr-3 mt-1" />
                                <div>
                                    <p className="text-text-muted text-sm">Full Name</p>
                                    <p className="text-text-white font-medium text-lg">{profile.patient.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Mail className="h-5 w-5 text-primary-main mr-3 mt-1" />
                                <div>
                                    <p className="text-text-muted text-sm">Email</p>
                                    <p className="text-text-white font-medium">{profile.user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Phone className="h-5 w-5 text-primary-main mr-3 mt-1" />
                                <div>
                                    <p className="text-text-muted text-sm">Phone Number</p>
                                    <p className="text-text-white font-medium">{profile.patient.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-primary-main mr-3 mt-1" />
                                <div>
                                    <p className="text-text-muted text-sm">Address</p>
                                    <p className="text-text-white font-medium">{profile.patient.address || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 text-primary-main mr-3 mt-1" />
                                <div>
                                    <p className="text-text-muted text-sm">Date of Birth</p>
                                    <p className="text-text-white font-medium">
                                        {new Date(profile.patient.birthDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <FileText className="h-5 w-5 text-primary-main mr-3 mt-1" />
                                <div>
                                    <p className="text-text-muted text-sm">NIK (ID Number)</p>
                                    <p className="text-text-white font-medium">{profile.patient.nik}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Account Information */}
            <Card className="p-6">
                <h3 className="text-xl font-bold text-text-white mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-text-muted text-sm mb-1">Account Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${profile.user.isActive
                            ? 'bg-status-success/20 text-status-success'
                            : 'bg-status-error/20 text-status-error'
                            }`}>
                            {profile.user.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <p className="text-text-muted text-sm mb-1">Member Since</p>
                        <p className="text-text-white font-medium">
                            {new Date(profile.user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};
