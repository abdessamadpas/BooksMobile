import { StyleSheet , ActivityIndicator, FlatList, TextInput, Button} from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import BookItem from '../components/BookItem';
import { useState } from 'react';


const query = gql`
  query SearchBooks($q: String) {
    googleBooksSearch(q: $q, country: "US") {
      items {
        id
        volumeInfo {
          authors
          averageRating
          description
          imageLinks {
            thumbnail
          }
          title
          subtitle
          industryIdentifiers {
            identifier
            type
          }
        }
      }
    }
    openLibrarySearch(q: $q) {
      docs {
        author_name
        title
        cover_edition_key
        isbn
      }
    }
  }
`;

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {

 const [search, setSearch ] = useState("wewe")
 const [provider, setProvider]= useState<"googleBooksSearch" | "openLibrarySearch">("googleBooksSearch")
  const[ runQuery,{data, loading, error}] = useLazyQuery(query)

  const parseBook  = (item: any): Book=>{
    if(provider=== "googleBooksSearch"){
      return {
          title: item.volumeInfo.title,
          image: item.volumeInfo.imageLinks?.thumbnail,
          authors: item.volumeInfo.authors,
          isbn : "wewe"
          //isbn: item.volumeInfo?.industryIdentifiers[0]?.identifier,
        }
    }
    return{
      image:`https://covers.openlibrary.org/b/olid/${item.cover_edition_key}-M.jpg`,
      title:item.title,
      authors: item.author_name,
      isbn: item.isbn?.[0],
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput 
        placeholder='search ...' 
        value={search}
        onChangeText={setSearch}
        style={styles.input}/>
        <Button 
        title='search'onPress={()=> runQuery({variables:{q:search}}) }
        />
      </View>
      <View style={styles.tabs}>
        <Text
          style={provider=== "googleBooksSearch"
          ? {fontWeight:'bold' ,color:'royalblue'}
          : {} }
          onPress={()=>setProvider("googleBooksSearch")}
        > Google Books </Text>
        <Text
          style={provider=== "openLibrarySearch"
          ? {fontWeight:'bold' ,color:'royalblue'}
          : {} }
          onPress={()=> setProvider("openLibrarySearch")}
        > Open Library </Text>
      </View>
      {loading && <ActivityIndicator/>}
      {error && (
        <View>
          <Text> Error fetshing books</Text>
          <Text> {error.message}</Text>
        </View>
      )}

<FlatList
  data={ provider ==="googleBooksSearch" 
    ? data?.googleBooksSearch?.items
    : data?.openLibrarySearch.docs || []}
  renderItem={({ item }) => (
    <BookItem
      book={ parseBook(item)}
    />
  )}
  showsVerticalScrollIndicator={false}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
   
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  header:{
    flexDirection:'row',
    alignItems:"center",

  },
  input:{
    flex:1,
    borderColor: 'gainsboro',
    borderWidth: 1,
    borderRadius:15,
    padding: 10,
    marginVertical:5,
    marginHorizontal:5
  },
  tabs:{
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems:'center',
    height:50

  }
});
