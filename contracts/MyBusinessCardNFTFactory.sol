// SPDX-License-Identifier: MIT
pragma solidity >0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

//Errors
error No_Business_Card_NFTs_To_Transfer();


contract MyBusinessCardNFTFactory is ERC721 {
    //State Variables
    uint public tokenId; //처음 선언할 때 tokenId=0

    struct BusinessCardInfo { //내 명함에 들어가는 기본적인 정보들로 구조체(여러 개의 변수를 하나의 단위로 묶어서 관리할 수 있게 해주는 데이터 타입)를 만듦
        //essential
        string name;
        string email;
        address issuer; //발급한 사람. 즉 명함 정보의 주인
        
        //optional
        string favorite_food;
        string favorite_movie;
        string favorite_sport;
        string favorite_song;
        string favorite_coffee;
        string hobby;
        string company;
        string major;
    }

    mapping(address  => BusinessCardInfo ) private _infos; //issuer가 발급한 명함 정보
    mapping(address => uint[]) private _tokenIdsMadeByIssuer;  //issuer가 발급한 명함의 tokenId들
    mapping(address => mapping(uint=> bool)) private _isTokenStillOwnedByIssuer; //issuer가 발급한 tokenId들이 현재 issuer에게 있는지. 있으면 true, 없으면 false
    mapping(uint => address) private _issuerOfToken; //tokenId의 issuer
    mapping(address => uint) private _amountOfTokenOwnedByIssuer; //issuer가 현재 가지고 있는 자신의 명함 개수(발급한 양 - 남들에게 transfer한 양) //ERC721의 _balances는 자신의 명함 개수 뿐만 아니라 자신이 받은 명함 개수까지 value값으로 가진다는 점에서 이 mapping과 차이점을 가짐. 


    //Events
    event BusinessCardInfoRegistered(
        address indexed issuer,
        string name,
        string email,
        string favorite_food,
        string favorite_movie,
        string favorite_sport,
        string favorite_song,
        string favorite_coffee,
        string hobby,
        string company,
        string major
    );

    event BusinessCardNFTMinted(
        uint indexed tokenId,
        address issuer,
        uint amountOfTokenOwnedByIssuer
    );

    event BusinessCardNFTTransfered(
        address indexed to,
        address from,
        uint tokenId,
        uint amountOfTokenOwnedByIssuer
    );


    //Modifiers
    modifier isBusinessCardInfoRegistered(){
        BusinessCardInfo memory businessCardInfo = _infos[msg.sender];
        require(
            keccak256(abi.encodePacked(businessCardInfo.name)) != keccak256(abi.encodePacked("")),
            "Register your Business Card Info First"
        );
        _;
    }


    //Constructors
    constructor() ERC721("MyBusinessCardNFT", "MyBCard") {}


    //Functions
    function registerBusinessCardInfo (//자신의 명함 NFT 정보 작성
        string memory _name,
        string memory _email,
        string memory _favorite_food,
        string memory _favorite_movie,
        string memory _favorite_sport,
        string memory _favorite_song,
        string memory _favorite_coffee,
        string memory _hobby,
        string memory _company,
        string memory _major
    )public{
        BusinessCardInfo memory businessCardInfo = BusinessCardInfo({
            name:_name,
            email:_email,
            issuer: msg.sender,
            favorite_food:_favorite_food,
            favorite_movie:_favorite_movie,
            favorite_sport:_favorite_sport,
            favorite_song:_favorite_song,
            favorite_coffee:_favorite_coffee,
            hobby:_hobby,
            company:_company,
            major:_major
        });
               
        _infos[msg.sender] = businessCardInfo;

        emit BusinessCardInfoRegistered(msg.sender, _name, _email, _favorite_food, _favorite_movie,_favorite_sport, _favorite_song ,_favorite_coffee, _hobby ,_company, _major);
    } 

    function mintBusinessCardNFT () public payable isBusinessCardInfoRegistered{ //자신의 명함 NFT 한 개 발급      
        tokenId++;
        
        _mint(msg.sender, tokenId);

        //tokenIds 관련 매핑 업데이트
        uint[] storage tokenIdsMadeByIssuer = _tokenIdsMadeByIssuer[msg.sender];
        tokenIdsMadeByIssuer.push(tokenId);
        _isTokenStillOwnedByIssuer[msg.sender][tokenId] = true;
        _issuerOfToken[tokenId] = msg.sender;      
        _amountOfTokenOwnedByIssuer[msg.sender]++;

        emit BusinessCardNFTMinted(tokenId,msg.sender, _amountOfTokenOwnedByIssuer[msg.sender]);
    }

    function transferBusinessCardNFT (address to) public isBusinessCardInfoRegistered{
        require(_amountOfTokenOwnedByIssuer[msg.sender]!=0,"Mint your Business Card NFT first");

        uint _tokenIdToTransfer;
        uint[] memory tokenIdsMadeByIssuer =_tokenIdsMadeByIssuer[msg.sender];
        for (uint i=0;i<tokenIdsMadeByIssuer.length;i++) {
            uint _tokenIdMadeByIssuer = tokenIdsMadeByIssuer[i];
            if (_isTokenStillOwnedByIssuer[msg.sender][_tokenIdMadeByIssuer]==true) {
                _tokenIdToTransfer = _tokenIdMadeByIssuer;
                break;
            }
            if ((i==tokenIdsMadeByIssuer.length-1)&&(_isTokenStillOwnedByIssuer[msg.sender][_tokenIdMadeByIssuer]==false)){
                revert No_Business_Card_NFTs_To_Transfer();
            }
        }

        safeTransferFrom(msg.sender, to, _tokenIdToTransfer);

        //tokenIds 관련 매핑 업데이트
        _isTokenStillOwnedByIssuer[msg.sender][_tokenIdToTransfer]= false;
        _amountOfTokenOwnedByIssuer[msg.sender] --;

        emit BusinessCardNFTTransfered(to, msg.sender, _tokenIdToTransfer, _amountOfTokenOwnedByIssuer[msg.sender]);
    }


    //getter 함수
    function getBusinessCardInfo(address issuer) external view returns (BusinessCardInfo memory){
        return _infos[issuer];
    }

    function getAmountOfTokenOwnedByIssuer(address issuer) external view returns (uint){
        return _amountOfTokenOwnedByIssuer[issuer];
    }

}
