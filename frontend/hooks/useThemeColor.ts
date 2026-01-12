import { useAuth } from '../contexts/AuthContext';

export const THEME_COLORS = {
    male: '#2DD4BF',   // Teal
    female: '#FB7185', // Rose Pink
};

export const useThemeColor = () => {
    const { user } = useAuth();

    // Default to male (teal) if no gender set or unknown
    const gender = user?.settings_gender === 'female' ? 'female' : 'male';

    return THEME_COLORS[gender];
};
