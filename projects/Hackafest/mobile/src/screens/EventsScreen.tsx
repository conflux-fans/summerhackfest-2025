import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const mockEvents = [
  {
    id: '1',
    name: 'VIP Conference 2024',
    description: 'Exclusive conference for VIP NFT holders',
    location: 'Convention Center, Hall A',
    date: '2024-03-15',
    time: '09:00 AM',
    requiredNFTs: ['VIP Access Pass'],
    maxAttendees: 100,
    currentAttendees: 75,
    status: 'upcoming' as const,
    image: 'https://via.placeholder.com/300x200/22D3EE/FFFFFF?text=VIP+Conference',
  },
  {
    id: '2',
    name: 'Concert Night',
    description: 'Front row access to the biggest concert of the year',
    location: 'Arena Hall, Section A',
    date: '2024-03-20',
    time: '08:00 PM',
    requiredNFTs: ['Concert Ticket'],
    maxAttendees: 50,
    currentAttendees: 50,
    status: 'live' as const,
    image: 'https://via.placeholder.com/300x200/22C55E/FFFFFF?text=Concert',
  },
  {
    id: '3',
    name: 'Art Gallery Opening',
    description: 'Exclusive preview of new digital art collection',
    location: 'Art District Gallery',
    date: '2024-02-28',
    time: '06:00 PM',
    requiredNFTs: ['Exclusive Art Piece'],
    maxAttendees: 30,
    currentAttendees: 30,
    status: 'ended' as const,
    image: 'https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Art+Gallery',
  },
];

export default function EventsScreen() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#22D3EE';
      case 'live': return '#22C55E';
      case 'ended': return '#AAB7C4';
      default: return '#AAB7C4';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'live': return 'Live Now';
      case 'ended': return 'Ended';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>
            Discover events that require NFT verification
          </Text>
        </View>

        {mockEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard}>
            <Image source={{ uri: event.image }} style={styles.eventImage} />
            
            <View style={styles.eventContent}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventName}>{event.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
                </View>
              </View>
              
              <Text style={styles.eventDescription}>{event.description}</Text>
              
              <View style={styles.eventDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={16} color="#AAB7C4" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={16} color="#AAB7C4" />
                  <Text style={styles.detailText}>{event.date} at {event.time}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Ionicons name="people" size={16} color="#AAB7C4" />
                  <Text style={styles.detailText}>
                    {event.currentAttendees}/{event.maxAttendees} attendees
                  </Text>
                </View>
              </View>
              
              <View style={styles.requiredNFTs}>
                <Text style={styles.requiredNFTsTitle}>Required NFTs:</Text>
                {event.requiredNFTs.map((nft, index) => (
                  <View key={index} style={styles.nftTag}>
                    <Text style={styles.nftTagText}>{nft}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E6ECF2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAB7C4',
  },
  eventCard: {
    backgroundColor: '#101621',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E6ECF2',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventDescription: {
    fontSize: 14,
    color: '#AAB7C4',
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#AAB7C4',
    marginLeft: 8,
  },
  requiredNFTs: {
    marginTop: 8,
  },
  requiredNFTsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E6ECF2',
    marginBottom: 8,
  },
  nftTag: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  nftTagText: {
    fontSize: 12,
    color: '#22D3EE',
    fontWeight: '500',
  },
});
